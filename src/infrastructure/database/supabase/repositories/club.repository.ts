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
      opening_time: club.openingTime,
      closing_time: club.closingTime,
      zip_code: club.zipCode,
      has_parking: club.hasParking,
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

    const { error } = await supabase.from('clubs').insert(data);

    if (error) {
      console.error('Error saving club to Supabase:', error);
      throw new Error(`Failed to save club: ${error.message}`);
    }

    // Fetch saved club with coordinates using RPC
    const savedClub = await this.findById(club.id);
    if (!savedClub) {
      throw new Error('Failed to retrieve saved club');
    }

    return savedClub;
  }

  async findById(id: string): Promise<Club | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc('get_club_by_id', {
      club_id: id,
    });

    if (error) {
      console.error('Error fetching club by ID:', error);
      return null;
    }

    return data ? this.mapToDomain(data) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Club[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc('get_clubs_by_owner_id', {
      p_owner_id: ownerId,
    });

    if (error) {
      console.error('Error fetching clubs by owner ID:', error);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => this.mapToDomain(item));
  }

  async findByCity(city: string): Promise<Club[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc('get_clubs_by_city', {
      p_city: city,
    });

    if (error) {
      console.error('Error fetching clubs by city:', error);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

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

    const { data, error } = await supabase.rpc('get_all_clubs');

    if (error) {
      console.error('Error fetching all clubs:', error);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => this.mapToDomain(item));
  }

  async update(club: Club): Promise<Club> {
    const supabase = this.supabaseService.getClient();
    const data: any = {
      name: club.name,
      city: club.city,
      state: club.state,
      opening_time: club.openingTime,
      closing_time: club.closingTime,
      zip_code: club.zipCode,
      has_parking: club.hasParking,
      address: club.address,
      phone: club.phone,
      images: club.images,
    };

    // Update location geometry if coordinates are provided
    if (club.latitude !== undefined && club.longitude !== undefined) {
      data.location = `POINT(${club.longitude} ${club.latitude})`;
    }

    const { error } = await supabase
      .from('clubs')
      .update(data)
      .eq('id', club.id);

    if (error) {
      console.error('Error updating club:', error);
      throw new Error(`Failed to update club: ${error.message}`);
    }

    // Fetch updated club with coordinates using RPC
    const updatedClub = await this.findById(club.id);
    if (!updatedClub) throw new EntityNotFoundException('Club', club.id);

    return updatedClub;
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
      openingTime: data.opening_time || '08:00', // Default fallback for legacy data
      closingTime: data.closing_time || '22:00', // Default fallback for legacy data
      zipCode: data.zip_code,
      hasParking: data.has_parking,
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
