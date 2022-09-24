import { forwardRef, Module } from '@nestjs/common';
import { DatabaseSearchModule } from '../../../database-search/database-search.module';
import { DatabaseSearchService } from '../../../database-search/database-search.service';

import { LoggerService } from '../../../logger/logger.service';
import { UserModule } from '../../../user/user.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { LogActivityModule } from '../../../user/log-activity/log-activity.module';
import { LogActivityService } from '../../../user/log-activity/log-activity.service';
import { CountersService } from '../../../counters/counters.service';
import { CountersModule } from '../../../counters/counters.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    DatabaseSearchModule,
    LogActivityModule,
    CountersModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DatabaseSearchService,
    LoggerService,
    LogActivityService,
    CountersService,
  ],
})
export class DashboardModule {}
