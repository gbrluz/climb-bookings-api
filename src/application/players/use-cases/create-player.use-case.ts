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

    // Create player
    const player = Player.create({
      id: userId, // Use auth user ID
      fullName: dto.full_name,
      gender: dto.gender ?? null,
      birthDate: dto.birth_date ? new Date(dto.birth_date) : null,
      preferredSide: dto.preferred_side ?? null,
      category: dto.category ?? null,
      state: dto.state ?? null,
      city: dto.city ?? null,
      availability: dto.availability ?? null,
      photoUrl: dto.photo_url ?? null,
      phone: dto.phone ?? null,
    });

    return this.playerRepository.save(player);
  }
}
