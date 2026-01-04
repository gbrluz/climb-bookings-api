import { Injectable } from '@nestjs/common';
import type { IAuctionRepository } from '../../../domain/auctions/repositories/auction.repository.interface';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { Auction } from '../../../domain/auctions/entities/auction.entity';
import { CreateAuctionDto } from '../dto/create-auction.dto';
import { WebSocketService } from '../../../infrastructure/messaging/websocket/websocket.service';
import { OneSignalService } from '../../../infrastructure/messaging/push-notifications/onesignal.service';
import {
  InvalidOperationException,
  EntityNotFoundException,
} from '../../../common/exceptions/domain.exception';

@Injectable()
export class CreateAuctionUseCase {
  constructor(
    private readonly auctionRepository: IAuctionRepository,
    private readonly clubRepository: IClubRepository,
    private readonly webSocketService: WebSocketService,
    private readonly oneSignalService: OneSignalService,
  ) {}

  async execute(dto: CreateAuctionDto): Promise<Auction> {
    // Find nearby clubs using geolocation
    const nearbyClubs = await this.clubRepository.findNearby(
      dto.lat,
      dto.lon,
      10, // 10km radius
    );

    if (nearbyClubs.length === 0) {
      throw new EntityNotFoundException('Club', 'nearby clubs not found in this area');
    }

    // Create auction entity
    const auction = Auction.create({
      playerIds: dto.players,
      city: dto.city,
      date: new Date(dto.date),
      time: dto.time,
      category: dto.category,
      latitude: dto.lat,
      longitude: dto.lon,
    });

    // Save to Redis with TTL
    const savedAuction = await this.auctionRepository.save(auction);

    // Send real-time notifications to nearby clubs
    nearbyClubs.forEach((club) => {
      this.webSocketService.sendAuctionToClub(club.id, savedAuction.toPlainObject());
    });

    // Send push notifications to club owners
    try {
      await this.oneSignalService.sendToClubOwners(
        dto.city,
        'New Auction Available!',
        `A group wants to play on ${dto.date} at ${dto.time}. Accept before other clubs!`,
      );
    } catch (error) {
      console.error('Failed to send push notification:', error);
      // Don't fail the auction creation if push notification fails
    }

    console.log(`🚀 Auction ${auction.id} sent to ${nearbyClubs.length} nearby clubs`);

    return savedAuction;
  }
}
