import { forwardRef, Module } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

import { ApplicationController } from './application.controller';
import { PracticeManagementModule } from '../../loans/practice-management/practice-management.module';
import { UserService } from '../user.service';
import { UserModule } from '../user.module';
import { RolesModule } from '../roles/roles.module';
import { StateModule } from '../state/state.module';
import { ActivityModule } from '../activity/activity.module';
import { CountersModule } from '../../counters/counters.module';
import { CountersService } from '../../counters/counters.service';
import { ScreenTrackingModule } from '../screen-tracking/screen-tracking.module';
import { ApplicationService } from './application.service';
import { EsignatureModule } from '../esignature/esignature.module';
import { ConsentModule } from '../consent/consent.module';
import { PaymentManagementModule } from '../../loans/payments/payment-management/payment-management.module';
import { AgreementModule } from '../../loans/agreement/agreement.module';
import { PaymentManagementService } from '../../loans/payments/payment-management/payment-management.service';
import { ConsentService } from '../consent/consent.service';
import { PaymentScheduleHistoryModule } from '../../loans/payments/payment-schedule-history/payment-schedule-history.module';
import { MathExtModule } from '../../loans/mathext/mathext.module';
import { PuppeteerModule } from '../../puppeteer/puppeteer.module';
import { PuppeteerService } from '../../puppeteer/puppeteer.service';
import { S3Module } from '../../s3/s3.module';
import { S3Service } from '../../s3/s3.service';
import { LinkModule } from './link/link.module';
import { AppService } from '../../app.service';
import { LedgerModule } from '../../loans/ledger/ledger.module';
import { NunjucksCompilerModule } from '../../nunjucks-compiler/nunjucks-compiler.module';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { MandrillModule } from '../../mandrill/mandrill.module';
import { MandrillService } from '../../mandrill/mandrill.service';
import { LoanpaymentproModule } from '../../loans/payments/loanpaymentpro/loanpaymentpro.module';
import { LoanpaymentproService } from '../../loans/payments/loanpaymentpro/loanpaymentpro.service';

@Module({
  imports: [
    PracticeManagementModule,
    RolesModule,
    StateModule,
    ActivityModule,
    CountersModule,
    forwardRef(() => UserModule),
    ScreenTrackingModule,
    EsignatureModule,
    ConsentModule,
    PaymentManagementModule,
    AgreementModule,
    PaymentScheduleHistoryModule,
    MathExtModule,
    PuppeteerModule,
    S3Module,
    LinkModule,
    LedgerModule,
    NunjucksCompilerModule,
    MandrillModule,
    LoanpaymentproModule,
  ],
  controllers: [ApplicationController],
  providers: [
    AppService,
    CountersService,
    LoggerService,
    UserService,
    ApplicationService,
    PaymentManagementService,
    ConsentService,
    PuppeteerService,
    NunjucksCompilerService,
    LoanpaymentproService,
    S3Service,
    AppService,
    MandrillService,
  ],
})
export class ApplicationModule {}
