import { forwardRef, Module } from '@nestjs/common';
import { AppService } from '../../app.service';

import { LoggerService } from '../../logger/logger.service';
import { ConsentModule } from '../consent/consent.module';
import { DocumentsModule } from '../documents/documents.module';
import { ScreenTrackingModule } from '../../user/screen-tracking/screen-tracking.module';
import { UserModule } from '../user.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PaymentManagementModule } from '../../loans/payments/payment-management/payment-management.module';
import { LedgerService } from '../../loans/ledger/ledger.service';
import { LedgerModule } from '../../loans/ledger/ledger.module';
import { LoanpaymentproModule } from '../../loans/payments/loanpaymentpro/loanpaymentpro.module';
import { LoanpaymentproService } from '../../loans/payments/loanpaymentpro/loanpaymentpro.service';
import { PaymentService } from '../../loans/payments/payment.service';
import { PaymentScheduleHistoryModule } from '../../loans/payments/payment-schedule-history/payment-schedule-history.module';
import { CountersService } from '../../counters/counters.service';
import { MandrillService } from '../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { CountersModule } from '../../counters/counters.module';
import { LogActivityService } from '../../user/log-activity/log-activity.service';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import { LoanSettingsService } from '../../loans/loan-settings/loan-settings.service';
import { LoanSettingsModule } from '../../loans/loan-settings/loan-settings.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PaymentManagementModule,
    DocumentsModule,
    ConsentModule,
    LedgerModule,
    LoanpaymentproModule,
    ScreenTrackingModule,
    PaymentScheduleHistoryModule,
    CountersModule,
    LoanSettingsModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    AppService,
    LoggerService,
    LedgerService,
    LoanpaymentproService,
    PaymentService,
    CountersService,
    MandrillService,
    NunjucksCompilerService,
    LogActivityService,
    DatabaseSearchService,
    LoanSettingsService,
  ],
})
export class DashboardModule {}
