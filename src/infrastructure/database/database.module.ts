import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import { BookingRepository } from './supabase/repositories/booking.repository';
import { ClubRepository } from './supabase/repositories/club.repository';
import { CourtRepository } from './supabase/repositories/court.repository';
import { AuctionRepository } from './supabase/repositories/auction.repository';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
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
    {
      provide: 'IAuctionRepository',
      useClass: AuctionRepository,
    },
  ],
  exports: [
    SupabaseService,
    'IBookingRepository',
    'IClubRepository',
    'ICourtRepository',
    'IAuctionRepository',
  ],
})
export class DatabaseModule {}
