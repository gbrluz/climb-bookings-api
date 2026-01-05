import { Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import { Booking } from '../../../domain/bookings/entities/booking.entity';
import {
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';

@Injectable()
export class CancelBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new EntityNotFoundException('Booking', bookingId);
    }

    // Only the user who created the booking can cancel it
    if (booking.userId !== userId) {
      throw new InvalidOperationException('You can only cancel your own bookings');
    }

    // Cancel the booking (this will throw if already cancelled or completed)
    booking.cancel();

    // Save and return
    return this.bookingRepository.update(booking);
  }
}
