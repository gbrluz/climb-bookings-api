import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CreatePlayerUseCase } from '../../../application/players/use-cases/create-player.use-case';
import { GetPlayerUseCase } from '../../../application/players/use-cases/get-player.use-case';
import { UpdatePlayerUseCase } from '../../../application/players/use-cases/update-player.use-case';
import { CreatePlayerDto } from '../../../application/players/dto/create-player.dto';
import { UpdatePlayerDto } from '../../../application/players/dto/update-player.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(
    private readonly createPlayerUseCase: CreatePlayerUseCase,
    private readonly getPlayerUseCase: GetPlayerUseCase,
    private readonly updatePlayerUseCase: UpdatePlayerUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create player profile' })
  @ApiResponse({ status: 201, description: 'Player profile created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or profile already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPlayer(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreatePlayerDto,
  ) {
    const player = await this.createPlayerUseCase.execute(user.id, dto);
    return player.toPlainObject();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current player profile' })
  @ApiResponse({ status: 200, description: 'Player profile found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Player profile not found' })
  async getCurrentPlayer(@CurrentUser() user: CurrentUserData) {
    const player = await this.getPlayerUseCase.execute(user.id);
    return player.toPlainObject();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get player profile by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Player ID' })
  @ApiResponse({ status: 200, description: 'Player profile found' })
  @ApiResponse({ status: 404, description: 'Player profile not found' })
  async getPlayer(@Param('id') id: string) {
    const player = await this.getPlayerUseCase.execute(id);
    return player.toPlainObject();
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update player profile' })
  @ApiParam({ name: 'id', type: String, description: 'Player ID' })
  @ApiResponse({ status: 200, description: 'Player profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Can only update own profile' })
  @ApiResponse({ status: 404, description: 'Player profile not found' })
  async updatePlayer(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdatePlayerDto,
  ) {
    const player = await this.updatePlayerUseCase.execute(id, user.id, dto);
    return player.toPlainObject();
  }
}
