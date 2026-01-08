import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpireAuctionsUseCase } from '../../application/auctions/use-cases/expire-auctions.use-case';

@Injectable()
export class AuctionExpirationCron {
  constructor(private readonly expireAuctionsUseCase: ExpireAuctionsUseCase) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredAuctions() {
    console.log('🕐 Running auction expiration check...');
    try {
      await this.expireAuctionsUseCase.execute();
      console.log('✅ Auction expiration check completed');
    } catch (error) {
      console.error('❌ Error during auction expiration:', error);
    }
  }
}
