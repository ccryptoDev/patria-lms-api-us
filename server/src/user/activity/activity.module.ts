import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserActivity, UserActivitySchema } from './activity.schema';
import { ActivityService } from './activity.service';
import { LoggerService } from '../../logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
    ]),
  ],
  providers: [ActivityService, LoggerService],
  exports: [MongooseModule, ActivityService],
})
export class ActivityModule {}
