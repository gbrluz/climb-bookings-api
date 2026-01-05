import { Injectable } from '@nestjs/common';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { Court } from '../../../domain/courts/entities/court.entity';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GetClubCourtsUseCase {
  constructor(
    private readonly courtRepository: ICourtRepository,
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(clubId: string, activeOnly: boolean = false): Promise<Court[]> {
    // Validate club exists
    const club = await this.clubRepository.findById(clubId);
    if (!club) {
      throw new EntityNotFoundException('Club', clubId);
    }

    if (activeOnly) {
      return this.courtRepository.findActiveByClubId(clubId);
    }

    return this.courtRepository.findByClubId(clubId);
  }
}
