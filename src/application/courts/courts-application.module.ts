import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AddCourtToClubUseCase } from './use-cases/add-court-to-club.use-case';
import { ListCourtsByClubUseCase } from './use-cases/list-courts-by-club.use-case';
import { GetCourtUseCase } from './use-cases/get-court.use-case';
import { GetClubCourtsUseCase } from './use-cases/get-club-courts.use-case';
import { UpdateCourtUseCase } from './use-cases/update-court.use-case';
import { DeleteCourtUseCase } from './use-cases/delete-court.use-case';

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
    {
      provide: GetCourtUseCase,
      useFactory: (courtRepo) => {
        return new GetCourtUseCase(courtRepo);
      },
      inject: ['ICourtRepository'],
    },
    {
      provide: GetClubCourtsUseCase,
      useFactory: (courtRepo, clubRepo) => {
        return new GetClubCourtsUseCase(courtRepo, clubRepo);
      },
      inject: ['ICourtRepository', 'IClubRepository'],
    },
    {
      provide: UpdateCourtUseCase,
      useFactory: (courtRepo, clubRepo) => {
        return new UpdateCourtUseCase(courtRepo, clubRepo);
      },
      inject: ['ICourtRepository', 'IClubRepository'],
    },
    {
      provide: DeleteCourtUseCase,
      useFactory: (courtRepo, clubRepo) => {
        return new DeleteCourtUseCase(courtRepo, clubRepo);
      },
      inject: ['ICourtRepository', 'IClubRepository'],
    },
  ],
  exports: [
    AddCourtToClubUseCase,
    ListCourtsByClubUseCase,
    GetCourtUseCase,
    GetClubCourtsUseCase,
    UpdateCourtUseCase,
    DeleteCourtUseCase,
  ],
})
export class CourtsApplicationModule {}
