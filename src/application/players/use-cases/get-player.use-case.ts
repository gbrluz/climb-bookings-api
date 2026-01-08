import { Injectable } from '@nestjs/common';
import type { IPlayerRepository } from '../../../domain/players/repositories/player.repository.interface';
import { Player } from '../../../domain/players/entities/player.entity';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GetPlayerUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(playerId: string): Promise<Player> {
    const player = await this.playerRepository.findById(playerId);

    if (!player) {
      throw new EntityNotFoundException('Player', playerId);
    }

    return player;
  }
}
