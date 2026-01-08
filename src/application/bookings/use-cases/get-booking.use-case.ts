import { Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import { Booking } from '../../../domain/bookings/entities/booking.entity';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GetBookingUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new EntityNotFoundException('Booking', bookingId);
    }

    return booking;
  }
}
