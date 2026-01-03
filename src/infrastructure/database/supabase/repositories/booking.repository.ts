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
    const data = {
      id: booking.id,
      court_id: booking.courtId,
      user_id: booking.userId,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
      status: booking.status,
      booking_date: booking.bookingDate.toISOString(),
      price: booking.price,
    };

    const { data: savedData, error } = await supabase
      .from('reservations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return this.mapToDomain(savedData);
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
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('court_id', courtId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString());

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async findOverlapping(
    courtId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Booking[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('court_id', courtId)
      .lt('start_time', endTime.toISOString())
      .gt('end_time', startTime.toISOString())
      .in('status', [BookingStatus.PENDING, BookingStatus.CONFIRMED]);

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async update(booking: Booking): Promise<Booking> {
    const supabase = this.supabaseService.getClient();
    const data = {
      status: booking.status,
      price: booking.price,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedData, error } = await supabase
      .from('reservations')
      .update(data)
      .eq('id', booking.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedData) throw new EntityNotFoundException('Booking', booking.id);

    return this.mapToDomain(updatedData);
  }

  async delete(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('reservations').delete().eq('id', id);

    if (error) throw error;
  }

  private mapToDomain(data: any): Booking {
    return Booking.reconstitute({
      id: data.id,
      courtId: data.court_id,
      userId: data.user_id,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      status: data.status as BookingStatus,
      bookingDate: new Date(data.booking_date),
      price: data.price,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }
}
