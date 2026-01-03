import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@songkeys/nestjs-redis';
import { APP_GUARD } from '@nestjs/core';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';

// Presentation (HTTP Controllers)
import { BookingsModule } from './presentation/http/bookings/bookings.module';
import { ClubsModule } from './presentation/http/clubs/clubs.module';
import { CourtsModule } from './presentation/http/courts/courts.module';

// Legacy modules (to be migrated)
import { AuctionModule } from './auction/auction.module';
import { NotificationsModule } from './notifications/notifications.module';

// Common
import { AuthGuard } from './common/guards/auth.guard';

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
    BookingsModule,
    ClubsModule,
    CourtsModule,
    // Legacy modules (keep until migrated)
    AuctionModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
