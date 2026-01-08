import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateAuctionUseCase } from '../../../application/auctions/use-cases/create-auction.use-case';
import { ClaimAuctionUseCase } from '../../../application/auctions/use-cases/claim-auction.use-case';
import { ListAuctionsUseCase } from '../../../application/auctions/use-cases/list-auctions.use-case';
import { CreateAuctionDto } from '../../../application/auctions/dto/create-auction.dto';
import { ClaimAuctionDto } from '../../../application/auctions/dto/claim-auction.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Auctions')
@Controller('auction')
export class AuctionsController {
  constructor(
    private readonly createAuctionUseCase: CreateAuctionUseCase,
    private readonly claimAuctionUseCase: ClaimAuctionUseCase,
    private readonly listAuctionsUseCase: ListAuctionsUseCase,
  ) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new auction request' })
  @ApiResponse({ status: 201, description: 'Auction created and sent to nearby clubs' })
  @ApiResponse({ status: 400, description: 'Invalid input or no clubs found nearby' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAuction(@Body() dto: CreateAuctionDto) {
    const auction = await this.createAuctionUseCase.execute(dto);
    return auction.toPlainObject();
  }

  @Post('claim/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Club claims an auction' })
  @ApiParam({ name: 'id', type: String, description: 'Auction ID' })
  @ApiResponse({ status: 200, description: 'Auction claimed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid auction or already expired' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  @ApiResponse({ status: 409, description: 'Auction already claimed by another club' })
  async claimAuction(
    @Param('id') auctionId: string,
    @Body() dto: ClaimAuctionDto,
  ) {
    return await this.claimAuctionUseCase.execute(auctionId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all open auctions' })
  @ApiResponse({ status: 200, description: 'List of open auctions' })
  async listAuctions() {
    const auctions = await this.listAuctionsUseCase.execute();
    return auctions.map((auction) => auction.toPlainObject());
  }
}
