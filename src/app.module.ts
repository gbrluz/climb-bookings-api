import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BookingsModule } from './bookings/bookings.module';
import { ClubsModule } from './clubs/clubs.module';
import { AuctionModule } from './auction/auction.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@songkeys/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.forRoot({
      config: {
        // Usa a URL do Upstash que está no seu .env
        url: process.env.REDIS_URL, 
        // Adicione estas opções para evitar erros de conexão em nuvem
        connectTimeout: 10000
      },
    }),
    ScheduleModule.forRoot(), // Para ler o arquivo .env
    BookingsModule,
    ClubsModule,
    AuctionModule,
    NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
