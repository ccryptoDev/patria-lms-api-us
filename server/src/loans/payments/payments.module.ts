import { forwardRef, Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreenTrackingModule } from '../../user/screen-tracking/screen-tracking.module';

import { CountersModule } from '../../counters/counters.module';
import { CountersService } from '../../counters/counters.service';
import { MandrillModule } from '../../mandrill/mandrill.module';
import { MandrillService } from '../../mandrill/mandrill.service';
import { LoggerService } from '../../logger/logger.service';
import { LoanpaymentproModule } from './loanpaymentpro/loanpaymentpro.module';
import { PaymentManagementModule } from './payment-management/payment-management.module';
import { PaymentScheduleHistoryModule } from './payment-schedule-history/payment-schedule-history.module';
import { Payment, PaymentSchema } from './payment.schema';
import { PaymentService } from './payment.service';
import { AppService } from '../../app.service';
import { ConsentModule } from '../../user/consent/consent.module';
import { MathExtModule } from '../mathext/mathext.module';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerModule } from '../ledger/ledger.module';
import { LoanpaymentproService } from './loanpaymentpro/loanpaymentpro.service';
import { PaymentController } from './payment.controller';
import { PaymentCronService } from './payment-cron.service';
import { UserModule } from '../../user/user.module';
import { NunjucksCompilerModule } from '../../nunjucks-compiler/nunjucks-compiler.module';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { LoanSettingsService } from '../loan-settings/loan-settings.service';
import { LoanSettingsModule } from '../loan-settings/loan-settings.module';
import { LogActivityService } from '../../user/log-activity/log-activity.service';
import { LogActivityModule } from '../../user/log-activity/log-activity.module';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import { CarmelModule } from './carmel/carmel.module';
import { CarmelService } from './carmel/carmel.service';
import { PaymentManagementService } from './payment-management/payment-management.service';

@Global()
@Module({
  imports: [
    ConsentModule,
    CountersModule,
    LedgerModule,
    CarmelModule,
    LoanpaymentproModule,
    MathExtModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    PaymentManagementModule,
    PaymentScheduleHistoryModule,
    UserModule,
    ScreenTrackingModule,
    MandrillModule,
    NunjucksCompilerModule,
    LoanSettingsModule,
    LogActivityModule,
  ],
  providers: [
    AppService,
    CountersService,
    LedgerService,
    LoanpaymentproService,
    CarmelService,
    LoggerService,
    PaymentService,
    PaymentCronService,
    MandrillService,
    NunjucksCompilerService,
    LoanSettingsService,
    LogActivityService,
    DatabaseSearchService,
    PaymentManagementService,
  ],
  exports: [MongooseModule, CarmelModule, CarmelService],
  controllers: [PaymentController],
})
export class PaymentsModule {}
