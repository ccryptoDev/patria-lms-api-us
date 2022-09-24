import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  LoanInterestRate,
  LoanInterestRateSchema,
} from './interest-rate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanInterestRate.name, schema: LoanInterestRateSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class InterestRateModule {}
