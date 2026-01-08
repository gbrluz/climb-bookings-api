import { Injectable } from '@nestjs/common';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import { Court } from '../../../domain/courts/entities/court.entity';
import { EntityNotFoundException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class GetCourtUseCase {
  constructor(private readonly courtRepository: ICourtRepository) {}

  async execute(courtId: string): Promise<Court> {
    const court = await this.courtRepository.findById(courtId);

    if (!court) {
      throw new EntityNotFoundException('Court', courtId);
    }

    return court;
  }
}
