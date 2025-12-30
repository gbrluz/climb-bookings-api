import { Controller, Get, Post, Req, Body, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { BookingsService } from './bookings.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly availabilityService: AvailabilityService,  
    private readonly bookingsService: BookingsService
  ) {}

  @Get('availability')
  async getAvailability(
    @Query('courtId') courtId: string,
    @Query('date') date: string,
  ) {
    if (!courtId || !date) {
      throw new BadRequestException('courtId and date are required parameters.');
    }
    
    return await this.availabilityService.getAvailableSlots(courtId, date);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createBooking(
    @Body() bookingData: CreateBookingDto, // Tipagem forte aqui!
    @Req() req: any // O req vindo do Express/Passport
  ) {
    // Pegamos o ID do usuário injetado pelo AuthGuard no request
    const userId = req.user.id; 

    return await this.bookingsService.createDirectBooking({
      ...bookingData,
      user_id: userId
    });
  }
}