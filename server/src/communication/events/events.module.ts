import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSearchModule } from '../../database-search/database-search.module';
import { CountersModule } from '../../counters/counters.module';
import { CountersService } from '../../counters/counters.service';

import { LoggerService } from '../../logger/logger.service';
import { LogActivityModule } from '../../user/log-activity/log-activity.module';
import { LogActivityService } from '../../user/log-activity/log-activity.service';
import { EventsController } from './events.controller';
import { Events, EventsSchema } from './events.schema';
import { EventsService } from './events.service';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import { LoanSettingsModule } from '../../loans/loan-settings/loan-settings.module';

@Module({
  imports: [
    DatabaseSearchModule,
    LogActivityModule,
    CountersModule,
    LoanSettingsModule,
    MongooseModule.forFeature([{ name: Events.name, schema: EventsSchema }]),
  ],
  controllers: [EventsController],
  providers: [
    DatabaseSearchService,
    CountersService,
    EventsService,
    LogActivityService,
    LoggerService,
  ],
})
export class EventsModule {}
