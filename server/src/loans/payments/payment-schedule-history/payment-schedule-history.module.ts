import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  PaymentScheduleHistory,
  PaymentScheduleHistorySchema,
} from './payment-schedule-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PaymentScheduleHistory.name,
        schema: PaymentScheduleHistorySchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class PaymentScheduleHistoryModule {}
