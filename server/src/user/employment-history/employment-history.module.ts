import { Module } from '@nestjs/common';
import { EmploymentHistoryService } from './employment-history.service';
import { EmploymentHistoryController } from './employment-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmploymentHistory,
  EmploymentHistorySchema,
} from './employment-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmploymentHistory.name, schema: EmploymentHistorySchema },
    ]),
  ],
  controllers: [EmploymentHistoryController],
  providers: [EmploymentHistoryService],
  exports: [MongooseModule],
})
export class EmploymentHistoryModule {}
