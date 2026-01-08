import { Injectable } from '@nestjs/common';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { Club } from '../../../domain/clubs/entities/club.entity';

@Injectable()
export class ListClubsUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(city?: string): Promise<Club[]> {
    if (city) {
      return await this.clubRepository.findByCity(city);
    }
    return await this.clubRepository.findAll();
  }
}
