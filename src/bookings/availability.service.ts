import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { Slot } from './interfaces/booking.interface';

@Injectable()
export class AvailabilityService {
  private supabase = createClient(process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');

  async getAvailableSlots(courtId: string, date: string) {
    // 1. Buscar a quadra e o preço
    const { data: court, error: courtError } = await this.supabase
      .from('courts')
      .select('base_price, is_active')
      .eq('id', courtId)
      .single();

    if (courtError || !court?.is_active) {
      throw new InternalServerErrorException('Court not found or inactive');
    }

    // 2. Buscar reservas existentes para o dia
    const { data: reservations, error: resError } = await this.supabase
      .from('reservations')
      .select('start_time, end_time')
      .eq('court_id', courtId)
      .eq('booking_date', date)
      .neq('status', 'cancelled');

    if (resError) {
      throw new InternalServerErrorException('Failed to fetch reservations');
    }

    // 3. Lógica de geração de slots (Exemplo: das 06:00 às 23:00)
    const slots: Slot[] = [];
    const openingTime = 6 * 60; // 06:00 em minutos
    const closingTime = 23 * 60; // 23:00 em minutos
    const slotDuration = 90; // 1h30 por jogo de Padel

    for (let time = openingTime; time + slotDuration <= closingTime; time += slotDuration) {
      const startStr = this.minutesToHHMM(time);
      const endStr = this.minutesToHHMM(time + slotDuration);

      // Verificar se este horário conflita com alguma reserva
      const isBooked = reservations.some((res) => {
        return (
          (startStr >= res.start_time && startStr < res.end_time) ||
          (endStr > res.start_time && endStr <= res.end_time)
        );
      });

      slots.push({
        start: startStr,
        end: endStr,
        available: !isBooked,
        price: court.base_price,
      });
    }

    return {
      courtId,
      date,
      slots,
    };
  }

  private minutesToHHMM(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
  }
}