import { Injectable } from '@nestjs/common';
import { IPlayerRepository } from '../../../../domain/players/repositories/player.repository.interface';
import { Player, Gender, PreferredSide, Availability } from '../../../../domain/players/entities/player.entity';
import { SupabaseService } from '../supabase.service';
import { EntityNotFoundException } from '../../../../common/exceptions/domain.exception';

@Injectable()
export class PlayerRepository implements IPlayerRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async save(player: Player): Promise<Player> {
    const supabase = this.supabaseService.getClient();
    const data = {
      id: player.id,
      full_name: player.fullName,
      gender: player.gender,
      birth_date: player.birthDate?.toISOString().split('T')[0] ?? null,
      preferred_side: player.preferredSide,
      category: player.category,
      state: player.state,
      city: player.city,
      availability: player.availability,
      photo_url: player.photoUrl,
      phone: player.phone,
    };

    const { data: savedData, error } = await supabase
      .from('players')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error saving player:', error);
      throw new Error(`Failed to save player: ${error.message}`);
    }

    return this.mapToDomain(savedData);
  }

  async findById(id: string): Promise<Player | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error finding player by ID:', error);
      throw new Error(`Failed to find player: ${error.message}`);
    }

    return data ? this.mapToDomain(data) : null;
  }

  async findByUsername(username: string): Promise<Player | null> {
    // Note: The database doesn't have a username field
    // This method is kept for interface compatibility but will always return null
    return null;
  }

  async update(player: Player): Promise<Player> {
    const supabase = this.supabaseService.getClient();
    const data = {
      full_name: player.fullName,
      gender: player.gender,
      birth_date: player.birthDate?.toISOString().split('T')[0] ?? null,
      preferred_side: player.preferredSide,
      category: player.category,
      state: player.state,
      city: player.city,
      availability: player.availability,
      photo_url: player.photoUrl,
      phone: player.phone,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedData, error } = await supabase
      .from('players')
      .update(data)
      .eq('id', player.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating player:', error);
      throw new Error(`Failed to update player: ${error.message}`);
    }
    if (!updatedData) throw new EntityNotFoundException('Player', player.id);

    return this.mapToDomain(updatedData);
  }

  async delete(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('players').delete().eq('id', id);

    if (error) {
      console.error('Error deleting player:', error);
      throw new Error(`Failed to delete player: ${error.message}`);
    }
  }

  private mapToDomain(data: any): Player {
    return Player.reconstitute({
      id: data.id,
      fullName: data.full_name,
      gender: data.gender as Gender | null,
      birthDate: data.birth_date ? new Date(data.birth_date) : null,
      preferredSide: data.preferred_side as PreferredSide | null,
      category: data.category,
      state: data.state,
      city: data.city,
      availability: data.availability as Availability | null,
      photoUrl: data.photo_url,
      rankingPoints: data.ranking_points ?? 0,
      totalMatches: data.total_matches ?? 0,
      totalWins: data.total_wins ?? 0,
      winRate: data.win_rate ?? '0.00',
      isAdmin: data.is_admin ?? false,
      globalRankingPoints: data.global_ranking_points ?? '0.0',
      isProvisional: data.is_provisional ?? true,
      provisionalGamesPlayed: data.provisional_games_played ?? 0,
      canJoinLeagues: data.can_join_leagues ?? false,
      captainCount: data.captain_count ?? 0,
      phone: data.phone,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }
}
