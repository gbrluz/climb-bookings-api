import { Test, TestingModule } from '@nestjs/testing';
import { ClaimAuctionUseCase } from './claim-auction.use-case';
import { IAuctionRepository } from '../../../domain/auctions/repositories/auction.repository.interface';
import { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import { RedisService } from '../../../infrastructure/cache/redis/redis.service';
import { WebSocketService } from '../../../infrastructure/messaging/websocket/websocket.service';
import { Auction, AuctionStatus } from '../../../domain/auctions/entities/auction.entity';
import { Court, SurfaceType } from '../../../domain/courts/entities/court.entity';
import {
  EntityNotFoundException,
  BookingConflictException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';

describe('ClaimAuctionUseCase', () => {
  let useCase: ClaimAuctionUseCase;
  let auctionRepository: jest.Mocked<IAuctionRepository>;
  let bookingRepository: jest.Mocked<IBookingRepository>;
  let courtRepository: jest.Mocked<ICourtRepository>;
  let redisService: jest.Mocked<RedisService>;
  let webSocketService: jest.Mocked<WebSocketService>;

  const mockAuction = Auction.create({
    playerIds: ['player-1'],
    city: 'São Paulo',
    date: new Date('2024-01-20'),
    time: '18:00',
    category: '4th Category',
    latitude: -23.5505,
    longitude: -46.6333,
  });

  const mockCourt = Court.create({
    clubId: 'club-1',
    name: 'Court 1',
    surfaceType: SurfaceType.SYNTHETIC_GRASS,
    isIndoor: false,
    basePrice: 150,
  });

  beforeEach(async () => {
    auctionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByStatus: jest.fn(),
      findOpenAuctions: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    bookingRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCourtId: jest.fn(),
      findByUserId: jest.fn(),
      findByCourtIdAndDateRange: jest.fn(),
      findOverlapping: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    courtRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByClubId: jest.fn(),
      findActiveByClubId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    redisService = {
      acquireLock: jest.fn(),
      releaseLock: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      keys: jest.fn(),
      expire: jest.fn(),
    } as any;

    webSocketService = {
      sendAuctionToClub: jest.fn(),
      sendAuctionConfirmedToPlayer: jest.fn(),
      sendNewBookingToClub: jest.fn(),
      emitToRoom: jest.fn(),
      emitToAll: jest.fn(),
    } as any;

    useCase = new ClaimAuctionUseCase(
      auctionRepository,
      bookingRepository,
      courtRepository,
      redisService,
      webSocketService,
    );
  });

  describe('execute - Distributed Lock Tests', () => {
    const claimDto = {
      clubId: 'club-1',
      courtId: 'court-1',
    };

    it('should successfully claim auction with lock', async () => {
      // Arrange
      redisService.acquireLock.mockResolvedValue(true);
      auctionRepository.findById.mockResolvedValue(mockAuction);
      courtRepository.findById.mockResolvedValue(mockCourt);
      bookingRepository.findOverlapping.mockResolvedValue([]);
      bookingRepository.save.mockImplementation((booking) => Promise.resolve(booking));
      auctionRepository.update.mockImplementation((auction) => Promise.resolve(auction));

      // Act
      const result = await useCase.execute('auction-1', claimDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.reservationId).toBeDefined();
      expect(redisService.acquireLock).toHaveBeenCalledWith(
        'lock:auction-1',
        claimDto.clubId,
        30,
      );
      expect(redisService.releaseLock).toHaveBeenCalledWith('lock:auction-1');
      expect(webSocketService.sendAuctionConfirmedToPlayer).toHaveBeenCalled();
    });

    it('should throw BookingConflictException when lock is already acquired', async () => {
      // Arrange - Lock já está sendo usado por outro clube
      redisService.acquireLock.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute('auction-1', claimDto)).rejects.toThrow(
        BookingConflictException,
      );
      expect(auctionRepository.findById).not.toHaveBeenCalled();
      expect(redisService.releaseLock).not.toHaveBeenCalled();
    });

    it('should release lock even if error occurs', async () => {
      // Arrange
      redisService.acquireLock.mockResolvedValue(true);
      auctionRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute('auction-1', claimDto)).rejects.toThrow();
      expect(redisService.releaseLock).toHaveBeenCalledWith('lock:auction-1');
    });

    it('should throw EntityNotFoundException when auction not found', async () => {
      // Arrange
      redisService.acquireLock.mockResolvedValue(true);
      auctionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('auction-1', claimDto)).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(redisService.releaseLock).toHaveBeenCalled();
    });

    it('should throw InvalidOperationException when auction is not open', async () => {
      // Arrange
      const claimedAuction = Auction.reconstitute({
        ...mockAuction.toPlainObject(),
        status: AuctionStatus.CLAIMED,
      });
      redisService.acquireLock.mockResolvedValue(true);
      auctionRepository.findById.mockResolvedValue(claimedAuction);

      // Act & Assert
      await expect(useCase.execute('auction-1', claimDto)).rejects.toThrow(
        InvalidOperationException,
      );
      expect(redisService.releaseLock).toHaveBeenCalled();
    });

    it('should throw BookingConflictException when court has overlapping booking', async () => {
      // Arrange
      const openAuction = Auction.reconstitute({
        ...mockAuction.toPlainObject(),
        status: AuctionStatus.OPEN,
      });
      redisService.acquireLock.mockResolvedValue(true);
      auctionRepository.findById.mockResolvedValue(openAuction);
      courtRepository.findById.mockResolvedValue(mockCourt);
      bookingRepository.findOverlapping.mockResolvedValue([
        {} as any, // Já existe uma reserva
      ]);

      // Act & Assert
      await expect(useCase.execute('auction-1', claimDto)).rejects.toThrow(
        BookingConflictException,
      );
      expect(redisService.releaseLock).toHaveBeenCalled();
    });
  });
});
