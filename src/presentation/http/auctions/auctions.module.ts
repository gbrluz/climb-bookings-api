import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsApplicationModule } from '../../../application/auctions/auctions-application.module';

@Module({
  imports: [AuctionsApplicationModule],
  controllers: [AuctionsController],
})
export class AuctionsModule {}
