import { Injectable } from '@nestjs/common';
import type { IPlayerRepository } from '../../../domain/players/repositories/player.repository.interface';
import { Player } from '../../../domain/players/entities/player.entity';
import { InvalidOperationException } from '../../../common/exceptions/domain.exception';
import { CreatePlayerDto } from '../dto/create-player.dto';

@Injectable()
export class CreatePlayerUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(userId: string, dto: CreatePlayerDto): Promise<Player> {
    // Check if player already exists
    const existingPlayer = await this.playerRepository.findById(userId);
    if (existingPlayer) {
      throw new InvalidOperationException('Player profile already exists');
    }

    // Check if username is already taken
    const existingUsername = await this.playerRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new InvalidOperationException('Username already taken');
    }

    // Create player
    const player = Player.create({
      id: userId, // Use auth user ID
      username: dto.username,
      fullName: dto.full_name,
      category: dto.category ?? null,
      phone: dto.phone ?? null,
      avatarUrl: dto.avatar_url ?? null,
    });

    return this.playerRepository.save(player);
  }
}
