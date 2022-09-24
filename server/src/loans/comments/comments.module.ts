import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSearchModule } from '../../database-search/database-search.module';
import { CountersModule } from '../../counters/counters.module';
import { CountersService } from '../../counters/counters.service';

import { LoggerService } from '../../logger/logger.service';
import { LogActivityModule } from '../../user/log-activity/log-activity.module';
import { LogActivityService } from '../../user/log-activity/log-activity.service';
import { CommentsController } from './comments.controller';
import { Comments, CommentsSchema } from './comments.schema';
import { CommentsService } from './comments.service';
import { DatabaseSearchService } from '../../database-search/database-search.service';

@Module({
  imports: [
    DatabaseSearchModule,
    LogActivityModule,
    CountersModule,
    MongooseModule.forFeature([
      { name: Comments.name, schema: CommentsSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [
    DatabaseSearchService,
    CountersService,
    CommentsService,
    LogActivityService,
    LoggerService,
  ],
})
export class CommentsModule {}
