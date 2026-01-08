import { Module } from '@nestjs/common';
import { CourtsController } from './courts.controller';
import { CourtsApplicationModule } from '../../../application/courts/courts-application.module';
import { DatabaseModule } from '../../../infrastructure/database/database.module';

@Module({
  imports: [CourtsApplicationModule, DatabaseModule],
  controllers: [CourtsController],
})
export class CourtsModule {}
