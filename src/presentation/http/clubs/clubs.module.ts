import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsApplicationModule } from '../../../application/clubs/clubs-application.module';
import { CourtsApplicationModule } from '../../../application/courts/courts-application.module';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [ClubsApplicationModule, CourtsApplicationModule, DatabaseModule],
  controllers: [ClubsController],
})
export class ClubsModule {}
