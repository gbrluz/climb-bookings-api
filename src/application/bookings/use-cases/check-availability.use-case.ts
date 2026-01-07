import { Injectable } from '@nestjs/common';
import type { IBookingRepository } from '../../../domain/bookings/repositories/booking.repository.interface';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { TimeSlot } from '../../../domain/bookings/value-objects/time-slot.vo';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exception';
import { CheckAvailabilityDto } from '../dto/check-availability.dto';

@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly courtRepository: ICourtRepository,
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(dto: CheckAvailabilityDto): Promise<TimeSlot[]> {
    // Validate court exists
    const court = await this.courtRepository.findById(dto.courtId);
    if (!court) {
      throw new EntityNotFoundException('Court', dto.courtId);
    }

    // Get club to access operating hours
    const club = await this.clubRepository.findById(court.clubId);
    if (!club) {
      throw new EntityNotFoundException('Club', court.clubId);
    }

    // Parse opening and closing hours from club
    const [openHour, openMinute] = club.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = club.closingTime.split(':').map(Number);

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

    // Generate time slots based on club operating hours and court slot duration
    const slots: TimeSlot[] = [];
    let currentHour = openHour;
    let currentMinute = openMinute;

    // Calculate closing time in minutes
    const closingTimeMinutes = closeHour * 60 + closeMinute;

    while (true) {
      const currentTimeMinutes = currentHour * 60 + currentMinute;

      // Check if current time + slot duration exceeds closing time
      if (currentTimeMinutes + court.slotDuration > closingTimeMinutes) {
        break;
      }

      const slotStart = new Date(date);
      slotStart.setHours(currentHour, currentMinute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + court.slotDuration);

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
      currentMinute += court.slotDuration;
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
