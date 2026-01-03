import {
  Controller,
  Post,
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
import { AddCourtToClubUseCase } from '../../../application/courts/use-cases/add-court-to-club.use-case';
import { CreateCourtDto } from '../../../application/courts/dto/create-court.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';

@ApiTags('Courts')
@Controller('clubs/:clubId/courts')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CourtsController {
  constructor(
    private readonly addCourtToClubUseCase: AddCourtToClubUseCase,
  ) {}

  @Post()
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
}
