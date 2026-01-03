import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import { BookingRepository } from './supabase/repositories/booking.repository';
import { ClubRepository } from './supabase/repositories/club.repository';
import { CourtRepository } from './supabase/repositories/court.repository';

@Module({
  providers: [
    SupabaseService,
    {
      provide: 'IBookingRepository',
      useClass: BookingRepository,
    },
    {
      provide: 'IClubRepository',
      useClass: ClubRepository,
    },
    {
      provide: 'ICourtRepository',
      useClass: CourtRepository,
    },
  ],
  exports: [
    SupabaseService,
    'IBookingRepository',
    'IClubRepository',
    'ICourtRepository',
  ],
})
export class DatabaseModule {}
