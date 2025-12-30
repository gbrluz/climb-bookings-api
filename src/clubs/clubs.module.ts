import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

@Module({
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService], // Exportamos caso o BookingsModule precise validar algo aqui
})
export class ClubsModule {}