import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@songkeys/nestjs-redis';
import { APP_GUARD } from '@nestjs/core';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';

// Presentation (HTTP Controllers)
import { BookingsModule } from './presentation/http/bookings/bookings.module';
import { ClubsModule } from './presentation/http/clubs/clubs.module';
import { CourtsModule } from './presentation/http/courts/courts.module';
import { AuctionsModule } from './presentation/http/auctions/auctions.module';

// Common
import { AuthGuard } from './common/guards/auth.guard';
import { HealthController } from './common/health/health.controller';

// Cron jobs
import { AuctionExpirationCron } from './presentation/cron/auction-expiration.cron';
import { AuctionsApplicationModule } from './application/auctions/auctions-application.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS_URL,
        connectTimeout: 10000,
      },
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CacheModule,
    MessagingModule,
    BookingsModule,
    ClubsModule,
    CourtsModule,
    AuctionsModule,
    AuctionsApplicationModule, // For cron jobs
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuctionExpirationCron,
  ],
})
export class AppModule {}
