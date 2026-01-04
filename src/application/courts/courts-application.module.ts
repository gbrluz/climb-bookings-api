import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AddCourtToClubUseCase } from './use-cases/add-court-to-club.use-case';
import { ListCourtsByClubUseCase } from './use-cases/list-courts-by-club.use-case';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: AddCourtToClubUseCase,
      useFactory: (courtRepo, clubRepo) => {
        return new AddCourtToClubUseCase(courtRepo, clubRepo);
      },
      inject: ['ICourtRepository', 'IClubRepository'],
    },
    {
      provide: ListCourtsByClubUseCase,
      useFactory: (courtRepo) => {
        return new ListCourtsByClubUseCase(courtRepo);
      },
      inject: ['ICourtRepository'],
    },
  ],
  exports: [AddCourtToClubUseCase, ListCourtsByClubUseCase],
})
export class CourtsApplicationModule {}
