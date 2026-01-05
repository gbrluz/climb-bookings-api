import { Injectable } from '@nestjs/common';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import {
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';

@Injectable()
export class DeleteCourtUseCase {
  constructor(
    private readonly courtRepository: ICourtRepository,
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(courtId: string, userId: string): Promise<void> {
    const court = await this.courtRepository.findById(courtId);
    if (!court) {
      throw new EntityNotFoundException('Court', courtId);
    }

    // Verify user owns the club
    const club = await this.clubRepository.findById(court.clubId);
    if (!club) {
      throw new EntityNotFoundException('Club', court.clubId);
    }

    if (club.ownerId && club.ownerId !== userId) {
      throw new InvalidOperationException('Only the club owner can delete courts');
    }

    await this.courtRepository.delete(courtId);
  }
}
