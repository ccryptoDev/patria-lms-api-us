import { Module, forwardRef } from '@nestjs/common';
import { UserBankAccountService } from './user-bank-account.service';
import { UserBankAccountController } from './user-bank-account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserBankAccount,
  UserBankAccountSchema,
} from './user-bank-account.schema';
import { AppService } from '../../app.service';
import {
  LoanPaymentProCardTokenSchema,
  LoanPaymentProCardToken,
} from '../../loans/payments/loanpaymentpro/schemas/loanpaymentpro-card-token.schema';
import { LoanpaymentproModule } from '../../loans/payments/loanpaymentpro/loanpaymentpro.module';
import { LoanpaymentproService } from '../../loans/payments/loanpaymentpro/loanpaymentpro.service';
import {
  ScreenTracking,
  ScreenTrackingSchema,
} from '../screen-tracking/screen-tracking.schema';
import {
  PaymentManagement,
  PaymentManagementSchema,
} from '../../loans/payments/payment-management/payment-management.schema';
import { LoggerService } from '../../logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserBankAccount.name, schema: UserBankAccountSchema },
      {
        name: LoanPaymentProCardToken.name,
        schema: LoanPaymentProCardTokenSchema,
      },
      {
        name: ScreenTracking.name,
        schema: ScreenTrackingSchema,
      },
      {
        name: PaymentManagement.name,
        schema: PaymentManagementSchema,
      },
    ]),
    forwardRef(() => LoanpaymentproModule),
  ],
  controllers: [UserBankAccountController],
  providers: [
    UserBankAccountService,
    AppService,
    LoanpaymentproService,
    LoggerService,
  ],
  exports: [MongooseModule],
})
export class UserBankAccountModule { }
