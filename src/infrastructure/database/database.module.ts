import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import { BookingRepository } from './supabase/repositories/booking.repository';
import { ClubRepository } from './supabase/repositories/club.repository';
import { CourtRepository } from './supabase/repositories/court.repository';
import { AuctionRepository } from './supabase/repositories/auction.repository';
import { PlayerRepository } from './supabase/repositories/player.repository';
import { CacheModule } from '../cache/cache.module';

@Global()
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
    {
      provide: 'IPlayerRepository',
      useClass: PlayerRepository,
    },
  ],
  exports: [
    SupabaseService,
    'IBookingRepository',
    'IClubRepository',
    'ICourtRepository',
    'IAuctionRepository',
    'IPlayerRepository',
  ],
})
export class DatabaseModule {}
