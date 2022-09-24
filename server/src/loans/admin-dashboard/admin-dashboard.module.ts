import { Module } from '@nestjs/common';
import { ScreenTrackingModule } from '../../user/screen-tracking/screen-tracking.module';

import { LoggerService } from '../../logger/logger.service';
import { PaymentManagementModule } from '../payments/payment-management/payment-management.module';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { UserModule } from '../../user/user.module';
import { LogActivityService } from '../../user/log-activity/log-activity.service';
import { CountersModule } from '../../counters/counters.module';
import { MandrillModule } from '../../mandrill/mandrill.module';
import { NunjucksCompilerModule } from '../../nunjucks-compiler/nunjucks-compiler.module';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { AppService } from '../../app.service';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentService } from '../payments/payment.service';
import { PaymentScheduleHistoryModule } from '../payments/payment-schedule-history/payment-schedule-history.module';
import { LoanpaymentproModule } from '../payments/loanpaymentpro/loanpaymentpro.module';
import { LoanpaymentproService } from '../payments/loanpaymentpro/loanpaymentpro.service';
import { LedgerModule } from '../ledger/ledger.module';
import { LedgerService } from '../ledger/ledger.service';
import { PracticeManagementModule } from '../practice-management/practice-management.module';
import { DatabaseSearchModule } from '../../database-search/database-search.module';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import { ConsentService } from '../../user/consent/consent.service';
import { ConsentModule } from '../../user/consent/consent.module';
import { AgreementModule } from '../../loans/agreement/agreement.module';
import { PuppeteerModule } from '../../puppeteer/puppeteer.module';
import { PuppeteerService } from '../../puppeteer/puppeteer.service';
import { S3Service } from '../../s3/s3.service';
import { EsignatureModule } from '../../user/esignature/esignature.module';
import { ApplicationModule } from '../../user/application/application.module';
import { LoanSettingsService } from '../loan-settings/loan-settings.service';
import { LoanSettingsModule } from '../loan-settings/loan-settings.module';
import { AdminService } from '../../user/admin/admin.service';
import { AdminModule } from '../../user/admin/admin.module';
import { RolesModule } from '../../user/roles/roles.module';
import { EmploymentHistoryModule } from '../../user/employment-history/employment-history.module';
import { UserBankAccountModule } from '../../user/user-bank-account/user-bank-account.module';
import { UserBankAccountService } from '../../user/user-bank-account/user-bank-account.service';
import { TransunionModule } from '../underwriting/transunion/transunion.module';
import { TransunionService } from '../underwriting/transunion/transunion.service';
import { AuthService } from '../../user/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { secret } from '../../user/auth/auth.config';

@Module({
  imports: [
    CountersModule,
    DatabaseSearchModule,
    LedgerModule,
    LoanpaymentproModule,
    EsignatureModule,
    MandrillModule,
    NunjucksCompilerModule,
    PaymentManagementModule,
    PracticeManagementModule,
    PaymentScheduleHistoryModule,
    PaymentsModule,
    ScreenTrackingModule,
    UserModule,
    ConsentModule,
    AgreementModule,
    PuppeteerModule,
    ApplicationModule,
    LoanSettingsModule,
    AdminModule,
    RolesModule,
    EmploymentHistoryModule,
    UserBankAccountModule,
    TransunionModule,
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AdminDashboardController],
  providers: [
    AdminDashboardService,
    AppService,
    DatabaseSearchService,
    LedgerService,
    LoanpaymentproService,
    LogActivityService,
    LoggerService,
    NunjucksCompilerService,
    PaymentService,
    ConsentService,
    PuppeteerService,
    AppService,
    S3Service,
    LoanSettingsService,
    AdminService,
    UserBankAccountService,
    TransunionService,
    AuthService,
  ],
  exports: [EmploymentHistoryModule],
})
export class AdminDashboardModule { }
