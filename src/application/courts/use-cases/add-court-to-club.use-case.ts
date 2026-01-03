import { Injectable } from '@nestjs/common';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { Court } from '../../../domain/courts/entities/court.entity';
import {
  EntityNotFoundException,
  UnauthorizedException,
} from '../../../common/exceptions/domain.exception';
import { CreateCourtDto } from '../dto/create-court.dto';

@Injectable()
export class AddCourtToClubUseCase {
  constructor(
    private readonly courtRepository: ICourtRepository,
    private readonly clubRepository: IClubRepository,
  ) {}

  async execute(clubId: string, userId: string, dto: CreateCourtDto): Promise<Court> {
    // Validate club exists
    const club = await this.clubRepository.findById(clubId);
    if (!club) {
      throw new EntityNotFoundException('Club', clubId);
    }

    // Validate user is the owner
    if (!club.isOwnedBy(userId)) {
      throw new UnauthorizedException('Only club owner can add courts');
    }

    // Create court
    const court = Court.create({
      clubId,
      name: dto.name,
      surfaceType: dto.surface_type,
      isIndoor: dto.is_indoor,
      basePrice: dto.base_price,
      isActive: dto.is_active ?? true,
    });

    return await this.courtRepository.save(court);
  }
}
