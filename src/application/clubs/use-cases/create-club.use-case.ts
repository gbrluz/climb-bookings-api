import { Injectable } from '@nestjs/common';
import type { IClubRepository } from '../../../domain/clubs/repositories/club.repository.interface';
import { Club } from '../../../domain/clubs/entities/club.entity';
import { CreateClubDto } from '../dto/create-club.dto';

@Injectable()
export class CreateClubUseCase {
  constructor(private readonly clubRepository: IClubRepository) {}

  async execute(ownerId: string, dto: CreateClubDto): Promise<Club> {
    const club = Club.create({
      ownerId,
      name: dto.name,
      city: dto.city,
      state: dto.state,
      openingTime: dto.opening_time,
      closingTime: dto.closing_time,
      address: dto.address,
      phone: dto.phone,
      images: dto.images,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    return await this.clubRepository.save(club);
  }
}
