import { Injectable } from '@nestjs/common';
import type { IPlayerRepository } from '../../../domain/players/repositories/player.repository.interface';
import { Player } from '../../../domain/players/entities/player.entity';
import {
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';
import { UpdatePlayerDto } from '../dto/update-player.dto';

@Injectable()
export class UpdatePlayerUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(
    playerId: string,
    userId: string,
    dto: UpdatePlayerDto,
  ): Promise<Player> {
    const player = await this.playerRepository.findById(playerId);
    if (!player) {
      throw new EntityNotFoundException('Player', playerId);
    }

    // Only the player themselves can update their profile
    if (player.id !== userId) {
      throw new InvalidOperationException('You can only update your own profile');
    }

    // Update player profile
    player.updateProfile({
      fullName: dto.full_name,
      gender: dto.gender,
      birthDate: dto.birth_date ? new Date(dto.birth_date) : undefined,
      preferredSide: dto.preferred_side,
      category: dto.category,
      state: dto.state,
      city: dto.city,
      availability: dto.availability,
      photoUrl: dto.photo_url,
      phone: dto.phone,
    });

    return this.playerRepository.update(player);
  }
}
