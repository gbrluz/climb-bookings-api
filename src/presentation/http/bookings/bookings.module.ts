import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsApplicationModule } from '../../../application/bookings/bookings-application.module';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [BookingsApplicationModule, DatabaseModule],
  controllers: [BookingsController],
})
export class BookingsModule {}
