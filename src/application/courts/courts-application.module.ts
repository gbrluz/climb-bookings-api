import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AddCourtToClubUseCase } from './use-cases/add-court-to-club.use-case';

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
  ],
  exports: [AddCourtToClubUseCase],
})
export class CourtsApplicationModule {}
