import { Injectable } from '@nestjs/common';
import type { ICourtRepository } from '../../../domain/courts/repositories/court.repository.interface';
import { Court } from '../../../domain/courts/entities/court.entity';

@Injectable()
export class ListCourtsByClubUseCase {
  constructor(private readonly courtRepository: ICourtRepository) {}

  async execute(clubId: string): Promise<Court[]> {
    return await this.courtRepository.findActiveByClubId(clubId);
  }
}
