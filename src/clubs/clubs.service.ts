import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ClubProfile, Court } from './interfaces/club.interface';

@Injectable()
export class ClubsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  async findAllClubs(city?: string): Promise<ClubProfile[]> {
    let query = this.supabase.from('clubs').select('*');
    
    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }

  async findCourtsByClub(clubId: string): Promise<Court[]> {
    const { data, error } = await this.supabase
      .from('courts')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_active', true);

    if (error) throw new InternalServerErrorException(error.message);
    return data || [];
  }
  async createClub(clubData: Partial<ClubProfile>, userId: string): Promise<ClubProfile> {
    const { data: player } = await this.supabase
    .from('players')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (!player?.is_admin) {
    throw new ForbiddenException('Only platform admins can register new clubs.');
  }
    
    const { data, error } = await this.supabase
      .from('clubs')
      .insert([{ ...clubData, owner_id: userId }])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async createCourt(courtData: Partial<Court>, userId: string): Promise<Court> {
    // Validação de segurança: verificar se o utilizador é realmente o dono do clube
    const { data: club } = await this.supabase
      .from('clubs')
      .select('owner_id')
      .eq('id', courtData.club_id)
      .single();

    if (!club || club.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to add courts to this club.');
    }

    const { data, error } = await this.supabase
      .from('courts')
      .insert([courtData])
      .select()
      .single();

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}