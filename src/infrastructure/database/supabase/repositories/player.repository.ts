import { Injectable } from '@nestjs/common';
import { IPlayerRepository } from '../../../../domain/players/repositories/player.repository.interface';
import { Player } from '../../../../domain/players/entities/player.entity';
import { SupabaseService } from '../supabase.service';
import { EntityNotFoundException } from '../../../../common/exceptions/domain.exception';

@Injectable()
export class PlayerRepository implements IPlayerRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async save(player: Player): Promise<Player> {
    const supabase = this.supabaseService.getClient();
    const data = {
      id: player.id,
      username: player.username,
      full_name: player.fullName,
      category: player.category,
      phone: player.phone,
      avatar_url: player.avatarUrl,
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
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error finding player by username:', error);
      throw new Error(`Failed to find player: ${error.message}`);
    }

    return data ? this.mapToDomain(data) : null;
  }

  async update(player: Player): Promise<Player> {
    const supabase = this.supabaseService.getClient();
    const data = {
      username: player.username,
      full_name: player.fullName,
      category: player.category,
      phone: player.phone,
      avatar_url: player.avatarUrl,
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
      username: data.username,
      fullName: data.full_name,
      category: data.category,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }
}
