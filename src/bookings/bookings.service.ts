import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly supabase: SupabaseClient,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createDirectBooking(bookingData: CreateBookingDto & { user_id: string }) {
    const { court_id, start_time, end_time, user_id } = bookingData;
    const dateOnly = start_time.split('T')[0];

    // 1. Criar uma chave única de lock para este horário específico
    const lockKey = `lock:court:${court_id}:date:${dateOnly}:slot:${start_time}`;
    
    // Tenta definir a chave com expiração de 10 segundos (tempo para processar o DB)
    // NX = Only set if not exists
    const lockAcquired = await this.redis.set(lockKey, 'locked', 'EX', 10, 'NX');

    if (!lockAcquired) {
      throw new ConflictException('Este horário está sendo processado ou já foi reservado.');
    }

    try {
      // 2. Verificação de segurança no Supabase (Double Check)
      const { data: existing } = await this.supabase
        .from('reservations')
        .select('id')
        .eq('court_id', court_id)
        .eq('status', 'confirmed')
        .filter('start_time', 'lt', end_time)
        .filter('end_time', 'gt', start_time);

      if (existing && existing.length > 0) {
        throw new ConflictException('Horário indisponível no banco de dados.');
      }

      // 3. Persistência Final
      const { data: newBooking, error: insertError } = await this.supabase
        .from('reservations')
        .insert([{
          court_id,
          user_id,
          start_time,
          end_time,
          status: 'confirmed',
        }])
        .select().single();

      if (insertError) throw insertError;

      // 4. Notificar via WebSocket
      this.broadcastBooking(court_id, newBooking);

      return newBooking;

    } catch (error) {
      // Se algo der errado, liberamos o lock para outros tentarem
      await this.redis.del(lockKey);
      throw error;
    }
  }

  private async broadcastBooking(court_id: string, booking: any) {
    const { data: court } = await this.supabase
      .from('courts').select('club_id').eq('id', court_id).single();

    if (court?.club_id) {
      this.notificationsGateway.server.to(`club_${court.club_id}`).emit('new_booking', booking);
    }
  }
}