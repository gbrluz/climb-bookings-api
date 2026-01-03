import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateBookingUseCase } from '../../../application/bookings/use-cases/create-booking.use-case';
import { CheckAvailabilityUseCase } from '../../../application/bookings/use-cases/check-availability.use-case';
import { CreateBookingDto } from '../../../application/bookings/dto/create-booking.dto';
import { CheckAvailabilityDto } from '../../../application/bookings/dto/check-availability.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
  ) {}

  @Public()
  @Get('availability')
  @ApiOperation({ summary: 'Check court availability for a specific date' })
  @ApiQuery({ name: 'courtId', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'List of available time slots' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async checkAvailability(@Query() query: CheckAvailabilityDto) {
    const slots = await this.checkAvailabilityUseCase.execute(query);
    return slots.map((slot) => slot.toPlainObject());
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or booking conflict' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async createBooking(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateBookingDto,
  ) {
    const booking = await this.createBookingUseCase.execute(user.id, dto);
    return booking.toPlainObject();
  }
}
