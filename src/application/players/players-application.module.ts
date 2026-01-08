import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CreatePlayerUseCase } from './use-cases/create-player.use-case';
import { GetPlayerUseCase } from './use-cases/get-player.use-case';
import { UpdatePlayerUseCase } from './use-cases/update-player.use-case';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: CreatePlayerUseCase,
      useFactory: (playerRepo) => {
        return new CreatePlayerUseCase(playerRepo);
      },
      inject: ['IPlayerRepository'],
    },
    {
      provide: GetPlayerUseCase,
      useFactory: (playerRepo) => {
        return new GetPlayerUseCase(playerRepo);
      },
      inject: ['IPlayerRepository'],
    },
    {
      provide: UpdatePlayerUseCase,
      useFactory: (playerRepo) => {
        return new UpdatePlayerUseCase(playerRepo);
      },
      inject: ['IPlayerRepository'],
    },
  ],
  exports: [CreatePlayerUseCase, GetPlayerUseCase, UpdatePlayerUseCase],
})
export class PlayersApplicationModule {}
