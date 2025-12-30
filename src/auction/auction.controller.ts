import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuthGuard } from '../auth/auth.guard';
import type { AuctionRequest } from './interfaces/auction.interface';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async requestMatch(@Body() body: any) {
    const { lat, lon, ...data } = body;
    
    return await this.auctionService.createAuctionRequest(
      data as AuctionRequest,
      lat,
      lon
    );
  }

  @Post('claim/:id')
  @UseGuards(AuthGuard)
  async claimMatch(
    @Param('id') auctionId: string,
    @Body('clubId') clubId: string,
    @Body('courtId') courtId: string
  ) {
    return await this.auctionService.claimAuction(auctionId, clubId, courtId);
  }
}