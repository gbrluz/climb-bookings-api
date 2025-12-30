import { Controller, Get, Post, Body, Query, Param, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get()
  async getClubs(@Query('city') city: string) {
    return await this.clubsService.findAllClubs(city);
  }

  @Get(':id/courts')
  async getClubCourts(@Param('id') id: string) {
    return await this.clubsService.findCourtsByClub(id);
  }
  @Post()
  @UseGuards(AuthGuard)
  async createClub(@Body() clubData: any, @Req() req: any) {
    // Em produção, o userId vem do JWT validado (ex: req.user.id)
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Missing user identification');

    return await this.clubsService.createClub(clubData, userId);
  }

  @Post(':id/courts')
  @UseGuards(AuthGuard)
  async createCourt(
    @Param('id') clubId: string,
    @Body() courtData: any,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return await this.clubsService.createCourt({ ...courtData, club_id: clubId }, userId);
  }
}