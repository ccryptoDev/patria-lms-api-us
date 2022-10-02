import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MandrillModule } from '../../../mandrill/mandrill.module';
import { MandrillService } from '../../../mandrill/mandrill.service';
import { AppService } from '../../../app.service';
import { LoggerService } from '../../../logger/logger.service';
import { RolesModule } from '../../roles/roles.module';
import { AdminController } from '../admin.controller';
import { Admin, AdminSchema } from '../admin.schema';
import { AdminService } from '../admin.service';
import { DashboardModule } from '../dashboard/dashboard.module';
import { LogActivityModule } from '../../log-activity/log-activity.module';
import { LogActivityService } from '../../log-activity/log-activity.service';
import { CountersService } from '../../../counters/counters.service';
import { CountersModule } from '../../../counters/counters.module';
import { AdminApproval, AdminApprovalSchema } from './approval.schema';
import { AdminApprovalService } from './approval.service';
import { AdminApprovalController } from './approval.controller';
import { AdminModule } from '../admin.module';
import { NunjucksCompilerModule } from '../../../../src/nunjucks-compiler/nunjucks-compiler.module';
import { DatabaseSearchModule } from '../../../../src/database-search/database-search.module';
import { UserModule } from '../../../../src/user/user.module';

@Module({
  imports: [
    CountersModule,
    DashboardModule,
    LogActivityModule,
    // MandrillModule,
    MongooseModule.forFeature([
      { name: AdminApproval.name, schema: AdminApprovalSchema },
    ]),
    RolesModule,
    AdminModule,
    NunjucksCompilerModule,
    DatabaseSearchModule,
    UserModule,
  ],
  controllers: [AdminApprovalController],
  providers: [
    AdminService,
    AdminApprovalService,
    AppService,
    CountersService,
    LogActivityService,
    LoggerService,
    MandrillService,
  ],
  exports: [MongooseModule],
})
export class AdminApprovalModule { }
