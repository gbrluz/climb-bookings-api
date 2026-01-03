import { Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import { Booking } from '../../../domain/bookings/entities/booking.entity';
import {
  EntityNotFoundException,
  BookingConflictException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly courtRepository: ICourtRepository,
  ) {}

  async execute(userId: string, dto: CreateBookingDto): Promise<Booking> {
    // Validate court exists and is active
    const court = await this.courtRepository.findById(dto.court_id);
    if (!court) {
      throw new EntityNotFoundException('Court', dto.court_id);
    }

    if (!court.canBeBooked()) {
      throw new InvalidOperationException('Court is not available for booking');
    }

    const startTime = new Date(dto.start_time);
    const endTime = new Date(dto.end_time);

    // Validate time range
    if (endTime <= startTime) {
      throw new InvalidOperationException('End time must be after start time');
    }

    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationMinutes < 60) {
      throw new InvalidOperationException('Booking duration must be at least 60 minutes');
    }

    // Check for overlapping bookings
    const overlappingBookings = await this.bookingRepository.findOverlapping(
      dto.court_id,
      startTime,
      endTime,
    );

    if (overlappingBookings.length > 0) {
      throw new BookingConflictException(
        'Court is already booked for the selected time slot',
      );
    }

    // Create booking
    const booking = Booking.create({
      courtId: dto.court_id,
      userId,
      startTime,
      endTime,
      price: dto.price || court.basePrice,
      bookingDate: new Date(),
    });

    // Save and return
    const savedBooking = await this.bookingRepository.save(booking);

    // Confirm booking immediately if no issues
    savedBooking.confirm();
    await this.bookingRepository.update(savedBooking);

    return savedBooking;
  }
}
