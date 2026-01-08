import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CreateClubUseCase } from './use-cases/create-club.use-case';
import { ListClubsUseCase } from './use-cases/list-clubs.use-case';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: CreateClubUseCase,
      useFactory: (clubRepo) => {
        return new CreateClubUseCase(clubRepo);
      },
      inject: ['IClubRepository'],
    },
    {
      provide: ListClubsUseCase,
      useFactory: (clubRepo) => {
        return new ListClubsUseCase(clubRepo);
      },
      inject: ['IClubRepository'],
    },
  ],
  exports: [CreateClubUseCase, ListClubsUseCase],
})
export class ClubsApplicationModule {}
