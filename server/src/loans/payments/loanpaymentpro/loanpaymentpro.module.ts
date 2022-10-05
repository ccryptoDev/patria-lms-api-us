import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import loanPaymentProConfig from './loanpaymentpro.config';
import {
  LoanPaymentProCardSale,
  LoanPaymentProCardSaleSchema,
} from './schemas/loanpaymentpro-card-sale.schema';
import {
  LoanPaymentProCardToken,
  LoanPaymentProCardTokenSchema,
} from './schemas/loanpaymentpro-card-token.schema';
import { LoanpaymentproController } from './loanpaymentpro.controller';
import { LoanpaymentproService } from './loanpaymentpro.service';
import { PaymentManagementModule } from '../payment-management/payment-management.module';
import { PracticeManagementModule } from '../../practice-management/practice-management.module';
import { CountersModule } from '../../../counters/counters.module';
import { CountersService } from '../../../counters/counters.service';
import { LoggerService } from '../../../logger/logger.service';
import { AppService } from '../../../app.service';
import { ScreenTrackingModule } from '../../../user/screen-tracking/screen-tracking.module';
import { PaymentScheduleHistoryModule } from '../payment-schedule-history/payment-schedule-history.module';
import { FlexPayService } from '../flex-pay/flex-pay.service';
import FlexPayConfig from '../flex-pay/flex-pay.config';
import { FlexPayModule } from '../flex-pay/flexpay.module';
import { ScreenTrackingService } from '../../../user/screen-tracking/screen-tracking.service';
import { UserBankAccountService } from '../../../user/user-bank-account/user-bank-account.service';
import { UserBankAccountModule } from '../../../user/user-bank-account/user-bank-account.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [loanPaymentProConfig, FlexPayConfig] }),
    MongooseModule.forFeature([
      {
        name: LoanPaymentProCardToken.name,
        schema: LoanPaymentProCardTokenSchema,
      },
      {
        name: LoanPaymentProCardSale.name,
        schema: LoanPaymentProCardSaleSchema,
      },
    ]),
    CountersModule,
    forwardRef(() => PaymentManagementModule),
    PaymentScheduleHistoryModule,
    PracticeManagementModule,
    ScreenTrackingModule,
    FlexPayModule,
    forwardRef(() => UserBankAccountModule),
  ],
  providers: [
    LoanpaymentproService,
    ScreenTrackingService,
    CountersService,
    AppService,
    LoggerService,
    FlexPayService,
    UserBankAccountService,
  ],
  controllers: [LoanpaymentproController],
  exports: [MongooseModule, FlexPayService, UserBankAccountService],
})
export class LoanpaymentproModule { }
