import { Club } from '../entities/club.entity';

export interface IClubRepository {
  save(club: Club): Promise<Club>;
  findById(id: string): Promise<Club | null>;
  findByOwnerId(ownerId: string): Promise<Club[]>;
  findByCity(city: string): Promise<Club[]>;
  findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Club[]>;
  findAll(): Promise<Club[]>;
  update(club: Club): Promise<Club>;
  delete(id: string): Promise<void>;
}
