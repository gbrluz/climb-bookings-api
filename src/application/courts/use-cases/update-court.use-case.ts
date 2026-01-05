import { Injectable } from '@nestjs/common';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { Court } from '../../../domain/courts/entities/court.entity';
import {
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../common/exceptions/domain.exception';
import { UpdateCourtDto } from '../dto/update-court.dto';

@Injectable()
export class UpdateCourtUseCase {
  constructor(
    private readonly courtRepository: ICourtRepository,
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(
    courtId: string,
    userId: string,
    dto: UpdateCourtDto,
  ): Promise<Court> {
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
      throw new InvalidOperationException('Only the club owner can update courts');
    }

    // Update court properties
    if (dto.name !== undefined) {
      court.updateName(dto.name);
    }

    if (dto.base_price !== undefined) {
      court.updatePrice(dto.base_price);
    }

    if (dto.is_active !== undefined) {
      if (dto.is_active) {
        court.activate();
      } else {
        court.deactivate();
      }
    }

    return this.courtRepository.update(court);
  }
}
