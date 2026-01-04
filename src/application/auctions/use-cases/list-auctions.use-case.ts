import { Injectable } from '@nestjs/common';
import type { IAuctionRepository } from '../../../domain/auctions/repositories/auction.repository.interface';
import { Auction } from '../../../domain/auctions/entities/auction.entity';

@Injectable()
export class ListAuctionsUseCase {
  constructor(private readonly auctionRepository: IAuctionRepository) {}

  async execute(): Promise<Auction[]> {
    return await this.auctionRepository.findOpenAuctions();
  }
}
