import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MandrillModule } from '../../mandrill/mandrill.module';
import { MandrillService } from '../../mandrill/mandrill.service';
import { AppService } from '../../app.service';
import { PracticeManagementModule } from '../../loans/practice-management/practice-management.module';
import { LoggerService } from '../../logger/logger.service';
import { RolesModule } from '../roles/roles.module';
import { AdminController } from './admin.controller';
import { Admin, AdminSchema } from './admin.schema';
import { AdminService } from './admin.service';
import { NunjucksCompilerModule } from '../../nunjucks-compiler/nunjucks-compiler.module';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { LogActivityModule } from '../log-activity/log-activity.module';
import { LogActivityService } from '../log-activity/log-activity.service';
import { CountersService } from '../../counters/counters.service';
import { CountersModule } from '../../counters/counters.module';
import { DatabaseSearchModule } from '../../database-search/database-search.module';
import { DatabaseSearchService } from '../../database-search/database-search.service';

@Module({
  imports: [
    CountersModule,
    DashboardModule,
    DatabaseSearchModule,
    LogActivityModule,
    MandrillModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    NunjucksCompilerModule,
    // PracticeManagementModule,
    RolesModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AppService,
    CountersService,
    DatabaseSearchService,
    LogActivityService,
    LoggerService,
    MandrillService,
    NunjucksCompilerService,
  ],
  exports: [MongooseModule],
})
export class AdminModule {}
