import { Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import {
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeleteBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(bookingId: string, userId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new EntityNotFoundException('Booking', bookingId);
    }

    // Only the user who created the booking can delete it
    if (booking.userId !== userId) {
      throw new InvalidOperationException('You can only delete your own bookings');
    }

    await this.bookingRepository.delete(bookingId);
  }
}
