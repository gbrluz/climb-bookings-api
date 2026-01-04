import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CacheModule } from '../../infrastructure/cache/cache.module';
import { MessagingModule } from '../../infrastructure/messaging/messaging.module';
import { CreateAuctionUseCase } from './use-cases/create-auction.use-case';
import { ClaimAuctionUseCase } from './use-cases/claim-auction.use-case';
import { ListAuctionsUseCase } from './use-cases/list-auctions.use-case';
import { ExpireAuctionsUseCase } from './use-cases/expire-auctions.use-case';

@Module({
  imports: [DatabaseModule, CacheModule, MessagingModule],
  providers: [
    {
      provide: CreateAuctionUseCase,
      useFactory: (auctionRepo, clubRepo, websocket, onesignal) => {
        return new CreateAuctionUseCase(auctionRepo, clubRepo, websocket, onesignal);
      },
      inject: ['IAuctionRepository', 'IClubRepository', 'WebSocketService', 'OneSignalService'],
    },
    {
      provide: ClaimAuctionUseCase,
      useFactory: (auctionRepo, bookingRepo, courtRepo, redis, websocket) => {
        return new ClaimAuctionUseCase(
          auctionRepo,
          bookingRepo,
          courtRepo,
          redis,
          websocket,
        );
      },
      inject: [
        'IAuctionRepository',
        'IBookingRepository',
        'ICourtRepository',
        'RedisService',
        'WebSocketService',
      ],
    },
    {
      provide: ListAuctionsUseCase,
      useFactory: (auctionRepo) => {
        return new ListAuctionsUseCase(auctionRepo);
      },
      inject: ['IAuctionRepository'],
    },
    {
      provide: ExpireAuctionsUseCase,
      useFactory: (auctionRepo) => {
        return new ExpireAuctionsUseCase(auctionRepo);
      },
      inject: ['IAuctionRepository'],
    },
  ],
  exports: [
    CreateAuctionUseCase,
    ClaimAuctionUseCase,
    ListAuctionsUseCase,
    ExpireAuctionsUseCase,
  ],
})
export class AuctionsApplicationModule {}
