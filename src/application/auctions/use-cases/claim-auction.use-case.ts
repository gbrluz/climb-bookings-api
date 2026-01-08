import { Injectable } from '@nestjs/common';
import type { IAuctionRepository } from '../../../domain/auctions/repositories/auction.repository.interface';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import { Booking, BookingStatus } from '../../../domain/bookings/entities/booking.entity';
import { RedisService } from '../../../infrastructure/cache/redis/redis.service';
import { WebSocketService } from '../../../infrastructure/messaging/websocket/websocket.service';
import {
  EntityNotFoundException,
  BookingConflictException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';
import { ClaimAuctionDto } from '../dto/claim-auction.dto';

export interface ClaimAuctionResponse {
  success: boolean;
  reservationId?: string;
  message: string;
}

@Injectable()
export class ClaimAuctionUseCase {
  private readonly LOCK_TTL = 30; // 30 seconds

  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly courtRepository: ICourtRepository,
    private readonly redisService: RedisService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async execute(
    auctionId: string,
    dto: ClaimAuctionDto,
  ): Promise<ClaimAuctionResponse> {
    const lockKey = `lock:${auctionId}`;

    // Try to acquire distributed lock
    const lockAcquired = await this.redisService.acquireLock(
      lockKey,
      dto.clubId,
      this.LOCK_TTL,
    );

    if (!lockAcquired) {
      throw new BookingConflictException('This auction has already been claimed by another club');
    }

    try {
      // Find auction
      const auction = await this.auctionRepository.findById(auctionId);
      if (!auction) {
        throw new EntityNotFoundException('Auction', auctionId);
      }

      if (!auction.isOpen()) {
        throw new InvalidOperationException('Only open auctions can be claimed');
      }

      // Validate court exists
      const court = await this.courtRepository.findById(dto.courtId);
      if (!court) {
        throw new EntityNotFoundException('Court', dto.courtId);
      }

      if (!court.canBeBooked()) {
        throw new InvalidOperationException('Court is not available for booking');
      }

      // Calculate start and end time
      const [hours, minutes] = auction.time.split(':').map(Number);
      const startTime = new Date(auction.date);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 90); // 90-minute game

      // Check for overlapping bookings
      const overlapping = await this.bookingRepository.findOverlapping(
        dto.courtId,
        startTime,
        endTime,
      );

      if (overlapping.length > 0) {
        throw new BookingConflictException('Court is already booked for this time slot');
      }

      // Create booking
      const booking = Booking.create({
        courtId: dto.courtId,
        userId: auction.playerIds[0], // Leader of the group
        startTime,
        endTime,
        status: BookingStatus.CONFIRMED,
        price: court.basePrice,
        bookingDate: auction.date,
      });

      const savedBooking = await this.bookingRepository.save(booking);

      // Update auction status
      auction.claim(dto.clubId, savedBooking.id);
      await this.auctionRepository.update(auction);

      // Notify player via WebSocket
      this.webSocketService.sendAuctionConfirmedToPlayer(
        auction.playerIds[0],
        savedBooking.toPlainObject(),
      );

      console.log(`✅ Auction ${auctionId} claimed by club ${dto.clubId}`);

      return {
        success: true,
        reservationId: savedBooking.id,
        message: 'Match confirmed successfully at your club!',
      };
    } finally {
      // Always release the lock
      await this.redisService.releaseLock(lockKey);
    }
  }
}
