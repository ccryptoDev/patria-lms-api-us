import { MongooseModule } from '@nestjs/mongoose';
import { LogActivity, LogActivitySchema } from './log-activity.schema';
import { Global, Module } from '@nestjs/common';
import { CountersModule } from '../../counters/counters.module';
import { LogActivityService } from './log-activity.service';
import { LogActivityController } from './log-activity.controller';
import { CountersService } from '../../counters/counters.service';
import { LoggerService } from '../../logger/logger.service';
import { DatabaseSearchModule } from '../../database-search/database-search.module';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import { ScreenTrackingModule } from '../../user/screen-tracking/screen-tracking.module';
@Global()
@Module({
  imports: [
    DatabaseSearchModule,
    MongooseModule.forFeature([
      { name: LogActivity.name, schema: LogActivitySchema },
    ]),
    CountersModule,
    ScreenTrackingModule,
  ],
  providers: [
    CountersService,
    DatabaseSearchService,
    LogActivityService,
    LoggerService,
  ],
  exports: [MongooseModule, CountersModule, DatabaseSearchModule],
  controllers: [LogActivityController],
})
export class LogActivityModule {}
