import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CreateBookingUseCase } from './use-cases/create-booking.use-case';
import { CheckAvailabilityUseCase } from './use-cases/check-availability.use-case';
import { GetBookingUseCase } from './use-cases/get-booking.use-case';
import { GetUserBookingsUseCase } from './use-cases/get-user-bookings.use-case';
import { CancelBookingUseCase } from './use-cases/cancel-booking.use-case';
import { DeleteBookingUseCase } from './use-cases/delete-booking.use-case';

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
    {
      provide: GetBookingUseCase,
      useFactory: (bookingRepo) => {
        return new GetBookingUseCase(bookingRepo);
      },
      inject: ['IBookingRepository'],
    },
    {
      provide: GetUserBookingsUseCase,
      useFactory: (bookingRepo) => {
        return new GetUserBookingsUseCase(bookingRepo);
      },
      inject: ['IBookingRepository'],
    },
    {
      provide: CancelBookingUseCase,
      useFactory: (bookingRepo) => {
        return new CancelBookingUseCase(bookingRepo);
      },
      inject: ['IBookingRepository'],
    },
    {
      provide: DeleteBookingUseCase,
      useFactory: (bookingRepo) => {
        return new DeleteBookingUseCase(bookingRepo);
      },
      inject: ['IBookingRepository'],
    },
  ],
  exports: [
    CreateBookingUseCase,
    CheckAvailabilityUseCase,
    GetBookingUseCase,
    GetUserBookingsUseCase,
    CancelBookingUseCase,
    DeleteBookingUseCase,
  ],
})
export class BookingsApplicationModule {}
