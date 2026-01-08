import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateBookingUseCase } from '../../../application/bookings/use-cases/create-booking.use-case';
import { CheckAvailabilityUseCase } from '../../../application/bookings/use-cases/check-availability.use-case';
import { GetBookingUseCase } from '../../../application/bookings/use-cases/get-booking.use-case';
import { GetUserBookingsUseCase } from '../../../application/bookings/use-cases/get-user-bookings.use-case';
import { CancelBookingUseCase } from '../../../application/bookings/use-cases/cancel-booking.use-case';
import { DeleteBookingUseCase } from '../../../application/bookings/use-cases/delete-booking.use-case';
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
    private readonly getBookingUseCase: GetBookingUseCase,
    private readonly getUserBookingsUseCase: GetUserBookingsUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly deleteBookingUseCase: DeleteBookingUseCase,
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

  @Get('user/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserBookings(@CurrentUser() user: CurrentUserData) {
    const bookings = await this.getUserBookingsUseCase.execute(user.id);
    return bookings.map((booking) => booking.toPlainObject());
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async getBooking(@Param('id') id: string) {
    const booking = await this.getBookingUseCase.execute(id);
    return booking.toPlainObject();
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this booking' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const booking = await this.cancelBookingUseCase.execute(id, user.id);
    return booking.toPlainObject();
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiParam({ name: 'id', type: String, description: 'Booking ID' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async deleteBooking(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.deleteBookingUseCase.execute(id, user.id);
  }
}
