import { Auction, AuctionStatus } from '../entities/auction.entity';

export interface IAuctionRepository {
  save(auction: Auction): Promise<Auction>;
  findById(id: string): Promise<Auction | null>;
  findByStatus(status: AuctionStatus): Promise<Auction[]>;
  findOpenAuctions(): Promise<Auction[]>;
  update(auction: Auction): Promise<Auction>;
  delete(id: string): Promise<void>;
}
