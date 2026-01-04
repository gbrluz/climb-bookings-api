import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateClubUseCase } from '../../../application/clubs/use-cases/create-club.use-case';
import { ListClubsUseCase } from '../../../application/clubs/use-cases/list-clubs.use-case';
import { ListCourtsByClubUseCase } from '../../../application/courts/use-cases/list-courts-by-club.use-case';
import { CreateClubDto } from '../../../application/clubs/dto/create-club.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly createClubUseCase: CreateClubUseCase,
    private readonly listClubsUseCase: ListClubsUseCase,
    private readonly listCourtsByClubUseCase: ListCourtsByClubUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all clubs' })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of clubs' })
  async listClubs(@Query('city') city?: string) {
    const clubs = await this.listClubsUseCase.execute(city);
    return clubs.map((club) => club.toPlainObject());
  }

  @Public()
  @Get(':id/courts')
  @ApiOperation({ summary: 'Get all courts for a specific club' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'List of courts' })
  async getClubCourts(@Param('id') clubId: string) {
    const courts = await this.listCourtsByClubUseCase.execute(clubId);
    return courts.map((court) => court.toPlainObject());
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new club' })
  @ApiResponse({ status: 201, description: 'Club created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createClub(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateClubDto,
  ) {
    const club = await this.createClubUseCase.execute(user.id, dto);
    return club.toPlainObject();
  }
}
