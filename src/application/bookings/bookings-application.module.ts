import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CreateBookingUseCase } from './use-cases/create-booking.use-case';
import { CheckAvailabilityUseCase } from './use-cases/check-availability.use-case';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: CreateBookingUseCase,
      useFactory: (bookingRepo, courtRepo) => {
        return new CreateBookingUseCase(bookingRepo, courtRepo);
      },
      inject: ['IBookingRepository', 'ICourtRepository'],
    },
    {
      provide: CheckAvailabilityUseCase,
      useFactory: (bookingRepo, courtRepo) => {
        return new CheckAvailabilityUseCase(bookingRepo, courtRepo);
      },
      inject: ['IBookingRepository', 'ICourtRepository'],
    },
  ],
  exports: [CreateBookingUseCase, CheckAvailabilityUseCase],
})
export class BookingsApplicationModule {}
