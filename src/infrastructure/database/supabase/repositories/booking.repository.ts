import { Injectable } from '@nestjs/common';
import { IBookingRepository } from '../../../../domain/bookings/repositories/booking.repository.interface';
import { Booking, BookingStatus } from '../../../../domain/bookings/entities/booking.entity';
import { SupabaseService } from '../supabase.service';
import { EntityNotFoundException } from '../../../../common/exceptions/domain.exception';

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async save(booking: Booking): Promise<Booking> {
    const supabase = this.supabaseService.getClient();

    // Extract date and time components
    const bookingDate = booking.bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const startTime = this.formatTime(booking.startTime); // HH:MM:SS
    const endTime = this.formatTime(booking.endTime); // HH:MM:SS

    const data = {
      id: booking.id,
      court_id: booking.courtId,
      user_id: booking.userId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      status: booking.status,
      amount_paid: (booking.price || 0).toString(),
      open_for_matchmaking: booking.openForMatchmaking,
      target_category: booking.targetCategory,
    };

    const { data: savedData, error } = await supabase
      .from('reservations')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error saving booking:', error);
      throw new Error(`Failed to save booking: ${error.message}`);
    }

    return this.mapToDomain(savedData);
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  async findById(id: string): Promise<Booking | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? this.mapToDomain(data) : null;
  }

  async findByCourtId(courtId: string): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('court_id', courtId);

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async findByCourtIdAndDateRange(
    courtId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();

    // Extract just the date part (YYYY-MM-DD) for comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('court_id', courtId)
      .gte('booking_date', startDateStr)
      .lte('booking_date', endDateStr);

    if (error) {
      console.error('Error finding bookings by court and date range:', error);
      throw new Error(`Failed to find bookings: ${error.message}`);
    }

    return data.map((item) => this.mapToDomain(item));
  }

  async findOverlapping(
    courtId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();

    // Extract date and time for comparison
    const bookingDate = startTime.toISOString().split('T')[0];
    const startTimeStr = this.formatTime(startTime);
    const endTimeStr = this.formatTime(endTime);

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('court_id', courtId)
      .eq('booking_date', bookingDate)
      .lt('start_time', endTimeStr)
      .gt('end_time', startTimeStr)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error finding overlapping bookings:', error);
      throw new Error(`Failed to find overlapping bookings: ${error.message}`);
    }

    return data.map((item) => this.mapToDomain(item));
  }

  async update(booking: Booking): Promise<Booking> {
    const supabase = this.supabaseService.getClient();
    const data = {
      status: booking.status,
      amount_paid: (booking.price || 0).toString(),
      open_for_matchmaking: booking.openForMatchmaking,
      target_category: booking.targetCategory,
    };

    const { data: updatedData, error } = await supabase
      .from('reservations')
      .update(data)
      .eq('id', booking.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      throw new Error(`Failed to update booking: ${error.message}`);
    }
    if (!updatedData) throw new EntityNotFoundException('Booking', booking.id);

    return this.mapToDomain(updatedData);
  }

  async delete(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('reservations').delete().eq('id', id);

    if (error) throw error;
  }

  private mapToDomain(data: any): Booking {
    // Combine booking_date (DATE) with start_time/end_time (TIME)
    const bookingDate = new Date(data.booking_date);

    // Create full datetime by combining date + time
    const startTime = this.combineDateAndTime(data.booking_date, data.start_time);
    const endTime = this.combineDateAndTime(data.booking_date, data.end_time);

    return Booking.reconstitute({
      id: data.id,
      courtId: data.court_id,
      userId: data.user_id,
      startTime,
      endTime,
      status: data.status as BookingStatus,
      bookingDate,
      price: parseFloat(data.amount_paid || '0'),
      openForMatchmaking: data.open_for_matchmaking ?? false,
      targetCategory: data.target_category ?? null,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    // dateStr format: "2024-12-30"
    // timeStr format: "18:00:00"
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
  }
}
