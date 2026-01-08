import { Booking } from '../entities/booking.entity';

export interface IBookingRepository {
  save(booking: Booking): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findByCourtId(courtId: string): Promise<Booking[]>;
  findByUserId(userId: string): Promise<Booking[]>;
  findByCourtIdAndDateRange(
    courtId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Booking[]>;
  findOverlapping(
    courtId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Booking[]>;
  update(booking: Booking): Promise<Booking>;
  delete(id: string): Promise<void>;
}
