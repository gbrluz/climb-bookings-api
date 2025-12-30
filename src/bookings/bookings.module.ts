import { Module } from '@nestjs/common';
import { RedisModule } from '@songkeys/nestjs-redis';
import { AvailabilityService } from './availability.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { SupabaseClient } from '@supabase/supabase-js';

@Module({
  imports: [
    // Isso é o que está faltando para resolver o erro do terminal
    RedisModule,
    NotificationsModule
  ],
  controllers: [BookingsController],
  providers: [
    AvailabilityService, 
    BookingsService,
    {
    provide: SupabaseClient,
    // Verifique se os nomes no seu .env são exatamente estes
    useFactory: () => {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        throw new Error('Configuração do Supabase ausente no .env');
      }
      return new SupabaseClient(url, key);
    },
  }
  ],
  exports: [AvailabilityService, BookingsService], // Permite que outros módulos usem essa lógica se necessário
})
export class BookingsModule {}