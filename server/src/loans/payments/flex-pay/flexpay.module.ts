import { FlexPayService } from './flex-pay.service';
import { FlexPayController } from './flex-pay.controller';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import flexPayConfig from './flex-pay.config';
import { PaymentManagementModule } from '../payment-management/payment-management.module';
import { PaymentScheduleHistoryModule } from '../payment-schedule-history/payment-schedule-history.module';
import {
  FlexTransactionReport,
  FlexTransactionReportSchema,
} from './flex.schema';
import { LoggerService } from '../../../logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FlexTransactionReport.name,
        schema: FlexTransactionReportSchema,
      },
    ]),
    ConfigModule.forRoot({ load: [flexPayConfig] }),
  ],
  providers: [FlexPayService, LoggerService],
  controllers: [FlexPayController],
  exports: [MongooseModule],
})
export class FlexPayModule { }
