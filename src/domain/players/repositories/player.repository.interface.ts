import { Player } from '../entities/player.entity';

export interface IPlayerRepository {
  save(player: Player): Promise<Player>;
  findById(id: string): Promise<Player | null>;
  findByUsername(username: string): Promise<Player | null>;
  update(player: Player): Promise<Player>;
  delete(id: string): Promise<void>;
}

export const IPlayerRepository = Symbol('IPlayerRepository');
