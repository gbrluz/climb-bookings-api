import { Injectable } from '@nestjs/common';
import { ICourtRepository } from '../../../../domain/courts/repositories/court.repository.interface';
import { Court, SurfaceType } from '../../../../domain/courts/entities/court.entity';
import { SupabaseService } from '../supabase.service';
import { EntityNotFoundException } from '../../../../common/exceptions/domain.exception';

@Injectable()
export class CourtRepository implements ICourtRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async save(court: Court): Promise<Court> {
    const supabase = this.supabaseService.getClient();
    const data = {
      id: court.id,
      club_id: court.clubId,
      name: court.name,
      surface_type: court.surfaceType,
      is_indoor: court.isIndoor,
      base_price: court.basePrice,
      is_active: court.isActive,
    };

    const { data: savedData, error } = await supabase
      .from('courts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return this.mapToDomain(savedData);
  }

  async findById(id: string): Promise<Court | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error finding court by ID:', error);
      throw new Error(`Failed to find court: ${error.message}`);
    }

    return data ? this.mapToDomain(data) : null;
  }

  async findByClubId(clubId: string): Promise<Court[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('club_id', clubId);

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async findActiveByClubId(clubId: string): Promise<Court[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_active', true);

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async update(court: Court): Promise<Court> {
    const supabase = this.supabaseService.getClient();
    const data = {
      name: court.name,
      surface_type: court.surfaceType,
      is_indoor: court.isIndoor,
      base_price: court.basePrice,
      is_active: court.isActive,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedData, error } = await supabase
      .from('courts')
      .update(data)
      .eq('id', court.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedData) throw new EntityNotFoundException('Court', court.id);

    return this.mapToDomain(updatedData);
  }

  async delete(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('courts').delete().eq('id', id);

    if (error) throw error;
  }

  private mapToDomain(data: any): Court {
    return Court.reconstitute({
      id: data.id,
      clubId: data.club_id,
      name: data.name,
      surfaceType: data.surface_type as SurfaceType,
      isIndoor: data.is_indoor,
      basePrice: data.base_price,
      isActive: data.is_active,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }
}
