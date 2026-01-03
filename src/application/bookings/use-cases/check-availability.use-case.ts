import { Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import { TimeSlot } from '../../../domain/bookings/value-objects/time-slot.vo';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exception';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';

@Injectable()
export class CheckAvailabilityUseCase {
  // Standard padel game duration: 90 minutes
  private readonly SLOT_DURATION_MINUTES = 90;
  private readonly START_HOUR = 6; // 6:00 AM
  private readonly END_HOUR = 23; // 11:00 PM

  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly courtRepository: ICourtRepository,
  ) {}

  async execute(dto: CheckAvailabilityDto): Promise<TimeSlot[]> {
    // Validate court exists
    const court = await this.courtRepository.findById(dto.courtId);
    if (!court) {
      throw new EntityNotFoundException('Court', dto.courtId);
    }

    // Parse date
    const date = new Date(dto.date);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing bookings for the day
    const bookings = await this.bookingRepository.findByCourtIdAndDateRange(
      dto.courtId,
      startOfDay,
      endOfDay,
    );

    // Generate time slots
    const slots: TimeSlot[] = [];
    let currentHour = this.START_HOUR;
    let currentMinute = 0;

    while (currentHour < this.END_HOUR) {
      const slotStart = new Date(date);
      slotStart.setHours(currentHour, currentMinute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + this.SLOT_DURATION_MINUTES);

      // Check if slot is available
      const isAvailable = !bookings.some((booking) =>
        booking.overlapsWithTimeRange(slotStart, slotEnd),
      );

      const startTime = this.formatTime(slotStart);
      const endTime = this.formatTime(slotEnd);

      slots.push(
        TimeSlot.create(startTime, endTime, isAvailable, court.basePrice),
      );

      // Move to next slot
      currentMinute += this.SLOT_DURATION_MINUTES;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    return slots;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = '00';
    return `${hours}:${minutes}:${seconds}`;
  }
}
