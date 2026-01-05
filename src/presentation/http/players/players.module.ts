import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersApplicationModule } from '../../../application/players/players-application.module';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [PlayersApplicationModule, DatabaseModule],
  controllers: [PlayersController],
})
export class PlayersModule {}
