import { Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import { Booking } from '../../../domain/bookings/entities/booking.entity';

@Injectable()
export class GetUserBookingsUseCase {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(userId: string): Promise<Booking[]> {
    return this.bookingRepository.findByUserId(userId);
  }
}
