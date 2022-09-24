import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  PracticeManagement,
  PracticeManagementSchema,
} from './practice-management.schema';
import { PracticeManagementController } from './practice-management.controller';
import { PracticeManagementService } from './practice-management.service';
import { LoggerService } from '../../logger/logger.service';
import { AppService } from '../../app.service';
import { StateModule } from '../../user/state/state.module';
import { LogActivityModule } from '../../user/log-activity/log-activity.module';
import { LogActivityService } from '../../user/log-activity/log-activity.service';
import { CountersModule } from '../../counters/counters.module';
import { CountersService } from '../../counters/counters.service';
import { DatabaseSearchModule } from '../../database-search/database-search.module';
import { DatabaseSearchService } from '../../database-search/database-search.service';

@Module({
  imports: [
    DatabaseSearchModule,
    MongooseModule.forFeature([
      { name: PracticeManagement.name, schema: PracticeManagementSchema },
    ]),
    StateModule,
    LogActivityModule,
    CountersModule,
  ],
  exports: [MongooseModule],
  controllers: [PracticeManagementController],
  providers: [
    AppService,
    CountersService,
    DatabaseSearchService,
    LogActivityService,
    LoggerService,
    PracticeManagementService,
  ],
})
export class PracticeManagementModule {}
