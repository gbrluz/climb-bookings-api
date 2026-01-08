import { Injectable } from '@nestjs/common';
import type { IAuctionRepository } from '../../../domain/auctions/repositories/auction.repository.interface';

@Injectable()
export class ExpireAuctionsUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) {}

  async execute(): Promise<void> {
    const openAuctions = await this.auctionRepository.findOpenAuctions();

    for (const auction of openAuctions) {
      // Auction is automatically expired by Redis TTL (2 hours)
      // This cron job is for additional cleanup or notification logic

      const auctionAge = Date.now() - (auction.createdAt?.getTime() || 0);
      const fifteenMinutes = 15 * 60 * 1000;

      if (auctionAge > fifteenMinutes) {
        console.log(`⏰ Auction ${auction.id} is still active after 15 minutes`);

        // Optional: Send notification to players that no clubs are available
        // Optional: Update auction status to expired
        auction.expire();
        await this.auctionRepository.update(auction);
      }
    }
  }
}
