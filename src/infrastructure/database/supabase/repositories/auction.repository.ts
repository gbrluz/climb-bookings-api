import { Injectable } from '@nestjs/common';
import type { IAuctionRepository } from '../../../../domain/auctions/repositories/auction.repository.interface';
import { Auction, AuctionStatus } from '../../../../domain/auctions/entities/auction.entity';
import { RedisService } from '../../../cache/redis/redis.service';

@Injectable()
export class AuctionRepository implements IAuctionRepository {
  private readonly AUCTION_PREFIX = 'auction:';
  private readonly AUCTION_TTL = 7200; // 2 hours in seconds

  constructor(private readonly redisService: RedisService) {}

  async save(auction: Auction): Promise<Auction> {
    const key = this.getKey(auction.id);
    const data = JSON.stringify(auction.toPlainObject());

    await this.redisService.set(key, data, this.AUCTION_TTL);

    return auction;
  }

  async findById(id: string): Promise<Auction | null> {
    const key = this.getKey(id);
    const data = await this.redisService.get(key);

    if (!data) {
      return null;
    }

    return this.mapToDomain(JSON.parse(data));
  }

  async findByStatus(status: AuctionStatus): Promise<Auction[]> {
    const keys = await this.redisService.keys(`${this.AUCTION_PREFIX}*`);
    const auctions: Auction[] = [];

    for (const key of keys) {
      const data = await this.redisService.get(key);
      if (data) {
        const auction = this.mapToDomain(JSON.parse(data));
        if (auction.status === status) {
          auctions.push(auction);
        }
      }
    }

    return auctions;
  }

  async findOpenAuctions(): Promise<Auction[]> {
    return this.findByStatus(AuctionStatus.OPEN);
  }

  async update(auction: Auction): Promise<Auction> {
    const key = this.getKey(auction.id);
    const exists = await this.redisService.exists(key);

    if (!exists) {
      throw new Error(`Auction ${auction.id} not found`);
    }

    const data = JSON.stringify(auction.toPlainObject());
    await this.redisService.set(key, data, this.AUCTION_TTL);

    return auction;
  }

  async delete(id: string): Promise<void> {
    const key = this.getKey(id);
    await this.redisService.del(key);
  }

  private getKey(id: string): string {
    return `${this.AUCTION_PREFIX}${id}`;
  }

  private mapToDomain(data: any): Auction {
    return Auction.reconstitute({
      id: data.id,
      playerIds: data.playerIds,
      city: data.city,
      date: new Date(data.date),
      time: data.time,
      category: data.category,
      status: data.status as AuctionStatus,
      claimedByClubId: data.claimedByClubId,
      reservationId: data.reservationId,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }
}
