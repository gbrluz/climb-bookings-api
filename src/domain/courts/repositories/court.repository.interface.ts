import { Court } from '../entities/court.entity';

export interface ICourtRepository {
  save(court: Court): Promise<Court>;
  findById(id: string): Promise<Court | null>;
  findByClubId(clubId: string): Promise<Court[]>;
  findActiveByClubId(clubId: string): Promise<Court[]>;
  update(court: Court): Promise<Court>;
  delete(id: string): Promise<void>;
}
