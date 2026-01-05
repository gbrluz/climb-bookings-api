import { Injectable } from '@nestjs/common';
import { IClubRepository } from '../../../../domain/clubs/repositories/club.repository.interface';
import { Club } from '../../../../domain/clubs/entities/club.entity';
import { SupabaseService } from '../supabase.service';
import { EntityNotFoundException } from '../../../../common/exceptions/domain.exception';

@Injectable()
export class ClubRepository implements IClubRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async save(club: Club): Promise<Club> {
    const supabase = this.supabaseService.getClient();

    // Prepare data for Supabase with location geometry
    const data: any = {
      id: club.id,
      owner_id: club.ownerId,
      name: club.name,
      city: club.city,
      state: club.state,
      address: club.address,
      phone: club.phone,
      images: club.images,
      commission_rate: '0.00', // Default commission rate
    };

    // Add location geometry if coordinates are provided
    if (club.latitude !== undefined && club.longitude !== undefined) {
      // PostGIS format: POINT(longitude latitude)
      data.location = `POINT(${club.longitude} ${club.latitude})`;
    }

    const { data: savedData, error } = await supabase
      .from('clubs')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error saving club to Supabase:', error);
      throw new Error(`Failed to save club: ${error.message}`);
    }

    // Return club with coordinates from input (not from DB location field)
    return Club.reconstitute({
      ...savedData,
      latitude: club.latitude,
      longitude: club.longitude,
    });
  }

  async findById(id: string): Promise<Club | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data ? this.mapToDomain(data) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Club[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async findByCity(city: string): Promise<Club[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .ilike('city', `%${city}%`);

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<Club[]> {
    const supabase = this.supabaseService.getClient();
    const radiusMeters = radiusKm * 1000;

    const { data, error } = await supabase.rpc('get_nearby_clubs', {
      lat: latitude,
      lon: longitude,
      radius_meters: radiusMeters,
    });

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async findAll(): Promise<Club[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('clubs')
      .select('*');

    if (error) throw error;

    return data.map((item) => this.mapToDomain(item));
  }

  async update(club: Club): Promise<Club> {
    const supabase = this.supabaseService.getClient();
    const data: any = {
      name: club.name,
      city: club.city,
      state: club.state,
      address: club.address,
      phone: club.phone,
      images: club.images,
    };

    // Update location geometry if coordinates are provided
    if (club.latitude !== undefined && club.longitude !== undefined) {
      data.location = `POINT(${club.longitude} ${club.latitude})`;
    }

    const { data: updatedData, error } = await supabase
      .from('clubs')
      .update(data)
      .eq('id', club.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedData) throw new EntityNotFoundException('Club', club.id);

    // Return club with coordinates from input (not from DB location field)
    return Club.reconstitute({
      ...updatedData,
      latitude: club.latitude,
      longitude: club.longitude,
    });
  }

  async delete(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('clubs').delete().eq('id', id);

    if (error) throw error;
  }

  private mapToDomain(data: any): Club {
    return Club.reconstitute({
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      city: data.city,
      state: data.state,
      address: data.address,
      phone: data.phone,
      images: data.images,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }
}
