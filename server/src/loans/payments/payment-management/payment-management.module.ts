import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LedgerService } from '../../../loans/ledger/ledger.service';
import { CountersModule } from '../../../counters/counters.module';
import { CountersService } from '../../../counters/counters.service';
import { MathExtModule } from '../../../loans/mathext/mathext.module';
import { MathExtService } from '../../../loans/mathext/mathext.service';
import { LoggerService } from '../../../logger/logger.service';
import { ConsentModule } from '../../../user/consent/consent.module';
import { ScreenTrackingModule } from '../../../user/screen-tracking/screen-tracking.module';
import { PaymentScheduleHistoryModule } from '../payment-schedule-history/payment-schedule-history.module';
import {
  PaymentManagement,
  PaymentManagementSchema,
} from './payment-management.schema';
import { PaymentManagementService } from './payment-management.service';
import { LedgerModule } from '../../../loans/ledger/ledger.module';
import { AppService } from '../../../app.service';
import { PaymentManagementCronService } from './payment-management-cron.service';
import { PaymentManagementController } from './payment-management.controller';
import { LoanSettingsService } from '../../loan-settings/loan-settings.service';
import { LoanSettingsModule } from '../../loan-settings/loan-settings.module';
import { PaymentService } from '../../payments/payment.service';
import { LoanpaymentproService } from '../../payments/loanpaymentpro/loanpaymentpro.service';
import { UserModule } from '../../../user/user.module';
import { LoanpaymentproModule } from '../loanpaymentpro/loanpaymentpro.module';
import { MandrillService } from '../../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../../nunjucks-compiler/nunjucks-compiler.service';
import { LogActivityService } from '../../../user/log-activity/log-activity.service';
import { DatabaseSearchService } from '../../../database-search/database-search.service';
import { AdminService } from '../../../user/admin/admin.service';
import { AdminModule } from '../../../user/admin/admin.module';
import { RolesModule } from '../../../user/roles/roles.module';
import { PracticeManagementModule } from '../../../loans/practice-management/practice-management.module';
import { FlexPayService } from '../flex-pay/flex-pay.service';
import { FlexPayModule } from '../flex-pay/flexpay.module';
import { UserService } from '../../../user/user.service';
import { UserController } from '../../../user/user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentManagement.name, schema: PaymentManagementSchema },
    ]),
    ScreenTrackingModule,
    forwardRef(() => PaymentScheduleHistoryModule),
    forwardRef(() => ConsentModule),
    MathExtModule,
    CountersModule,
    LedgerModule,
    LoanSettingsModule,
    forwardRef(() => LoanpaymentproModule),
    AdminModule,
    RolesModule,
    PracticeManagementModule,
    ScreenTrackingModule,
    FlexPayModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    PaymentManagementService,
    MathExtService,
    CountersService,
    LedgerService,
    AppService,
    LoggerService,
    PaymentManagementCronService,
    LoanSettingsService,
    PaymentService,
    LoanpaymentproService,
    MandrillService,
    NunjucksCompilerService,
    LogActivityService,
    DatabaseSearchService,
    AdminService,
    FlexPayService,
  ],
  exports: [MongooseModule, PaymentManagementService, LoanpaymentproModule],
  controllers: [PaymentManagementController],
})
export class PaymentManagementModule { }
