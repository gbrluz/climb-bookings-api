import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AddCourtToClubUseCase } from '../../../application/courts/use-cases/add-court-to-club.use-case';
import { GetCourtUseCase } from '../../../application/courts/use-cases/get-court.use-case';
import { GetClubCourtsUseCase } from '../../../application/courts/use-cases/get-club-courts.use-case';
import { UpdateCourtUseCase } from '../../../application/courts/use-cases/update-court.use-case';
import { DeleteCourtUseCase } from '../../../application/courts/use-cases/delete-court.use-case';
import { CreateCourtDto } from '../../../application/courts/dto/create-court.dto';
import { UpdateCourtDto } from '../../../application/courts/dto/update-court.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Courts')
@Controller('clubs/:clubId/courts')
export class CourtsController {
  constructor(
    private readonly addCourtToClubUseCase: AddCourtToClubUseCase,
    private readonly getCourtUseCase: GetCourtUseCase,
    private readonly getClubCourtsUseCase: GetClubCourtsUseCase,
    private readonly updateCourtUseCase: UpdateCourtUseCase,
    private readonly deleteCourtUseCase: DeleteCourtUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all courts for a club' })
  @ApiParam({ name: 'clubId', type: String })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter active courts only' })
  @ApiResponse({ status: 200, description: 'List of courts' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async getClubCourts(
    @Param('clubId') clubId: string,
    @Query('active') activeOnly?: string,
  ) {
    const active = activeOnly === 'true';
    const courts = await this.getClubCourtsUseCase.execute(clubId, active);
    return courts.map((court) => court.toPlainObject());
  }

  @Public()
  @Get(':courtId')
  @ApiOperation({ summary: 'Get a specific court' })
  @ApiParam({ name: 'clubId', type: String })
  @ApiParam({ name: 'courtId', type: String })
  @ApiResponse({ status: 200, description: 'Court found' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async getCourt(@Param('courtId') courtId: string) {
    const court = await this.getCourtUseCase.execute(courtId);
    return court.toPlainObject();
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a court to a club' })
  @ApiParam({ name: 'clubId', type: String })
  @ApiResponse({ status: 201, description: 'Court added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only club owner can add courts' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async addCourt(
    @Param('clubId') clubId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateCourtDto,
  ) {
    const court = await this.addCourtToClubUseCase.execute(clubId, user.id, dto);
    return court.toPlainObject();
  }

  @Patch(':courtId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a court' })
  @ApiParam({ name: 'clubId', type: String })
  @ApiParam({ name: 'courtId', type: String })
  @ApiResponse({ status: 200, description: 'Court updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only club owner can update courts' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async updateCourt(
    @Param('courtId') courtId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateCourtDto,
  ) {
    const court = await this.updateCourtUseCase.execute(courtId, user.id, dto);
    return court.toPlainObject();
  }

  @Delete(':courtId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a court' })
  @ApiParam({ name: 'clubId', type: String })
  @ApiParam({ name: 'courtId', type: String })
  @ApiResponse({ status: 204, description: 'Court deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only club owner can delete courts' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async deleteCourt(
    @Param('courtId') courtId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.deleteCourtUseCase.execute(courtId, user.id);
  }
}
