import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuctionUseCase } from './create-auction.use-case';
import { IAuctionRepository } from '../../../domain/auctions/repositories/auction.repository.interface';
import { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { WebSocketService } from '../../../infrastructure/messaging/websocket/websocket.service';
import { OneSignalService } from '../../../infrastructure/messaging/push-notifications/onesignal.service';
import { Auction, AuctionStatus } from '../../../domain/auctions/entities/auction.entity';
import { Club } from '../../../domain/clubs/entities/club.entity';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exception';

describe('CreateAuctionUseCase', () => {
  let useCase: CreateAuctionUseCase;
  let auctionRepository: jest.Mocked<IAuctionRepository>;
  let clubRepository: jest.Mocked<IClubRepository>;
  let webSocketService: jest.Mocked<WebSocketService>;
  let oneSignalService: jest.Mocked<OneSignalService>;

  const mockClub = Club.create({
    id: 'club-1',
    ownerId: 'owner-1',
    name: 'Test Club',
    city: 'São Paulo',
    state: 'SP',
    latitude: -23.5505,
    longitude: -46.6333,
  });

  beforeEach(async () => {
    // Create mocks
    auctionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByStatus: jest.fn(),
      findOpenAuctions: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    clubRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByOwnerId: jest.fn(),
      findByCity: jest.fn(),
      findNearby: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    webSocketService = {
      sendAuctionToClub: jest.fn(),
      sendAuctionConfirmedToPlayer: jest.fn(),
      sendNewBookingToClub: jest.fn(),
      emitToRoom: jest.fn(),
      emitToAll: jest.fn(),
    } as any;

    oneSignalService = {
      sendNotification: jest.fn(),
      sendToCityAndCategory: jest.fn(),
      sendToClubOwners: jest.fn(),
      sendToUser: jest.fn(),
    } as any;

    useCase = new CreateAuctionUseCase(
      auctionRepository,
      clubRepository,
      webSocketService,
      oneSignalService,
    );
  });

  describe('execute', () => {
    const validDto = {
      players: ['player-1', 'player-2'],
      city: 'São Paulo',
      date: '2024-01-20',
      time: '18:00',
      category: '4th Category',
      lat: -23.5505,
      lon: -46.6333,
    };

    it('should create an auction and notify nearby clubs', async () => {
      // Arrange
      clubRepository.findNearby.mockResolvedValue([mockClub]);
      auctionRepository.save.mockImplementation((auction) => Promise.resolve(auction));
      oneSignalService.sendToClubOwners.mockResolvedValue({ success: true });

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result).toBeInstanceOf(Auction);
      expect(result.status).toBe(AuctionStatus.OPEN);
      expect(result.city).toBe(validDto.city);
      expect(clubRepository.findNearby).toHaveBeenCalledWith(
        validDto.lat,
        validDto.lon,
        10,
      );
      expect(auctionRepository.save).toHaveBeenCalled();
      expect(webSocketService.sendAuctionToClub).toHaveBeenCalledWith(
        mockClub.id,
        expect.any(Object),
      );
      expect(oneSignalService.sendToClubOwners).toHaveBeenCalled();
    });

    it('should throw EntityNotFoundException when no nearby clubs found', async () => {
      // Arrange
      clubRepository.findNearby.mockResolvedValue([]);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(auctionRepository.save).not.toHaveBeenCalled();
    });

    it('should create auction even if push notification fails', async () => {
      // Arrange
      clubRepository.findNearby.mockResolvedValue([mockClub]);
      auctionRepository.save.mockImplementation((auction) => Promise.resolve(auction));
      oneSignalService.sendToClubOwners.mockRejectedValue(new Error('OneSignal error'));

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result).toBeInstanceOf(Auction);
      expect(auctionRepository.save).toHaveBeenCalled();
      expect(webSocketService.sendAuctionToClub).toHaveBeenCalled();
    });

    it('should notify multiple nearby clubs', async () => {
      // Arrange
      const club2 = Club.create({
        id: 'club-2',
        ownerId: 'owner-2',
        name: 'Test Club 2',
        city: 'São Paulo',
        state: 'SP',
        latitude: -23.5515,
        longitude: -46.6343,
      });
      clubRepository.findNearby.mockResolvedValue([mockClub, club2]);
      auctionRepository.save.mockImplementation((auction) => Promise.resolve(auction));

      // Act
      await useCase.execute(validDto);

      // Assert
      expect(webSocketService.sendAuctionToClub).toHaveBeenCalledTimes(2);
      expect(webSocketService.sendAuctionToClub).toHaveBeenCalledWith(
        mockClub.id,
        expect.any(Object),
      );
      expect(webSocketService.sendAuctionToClub).toHaveBeenCalledWith(
        club2.id,
        expect.any(Object),
      );
    });
  });
});
