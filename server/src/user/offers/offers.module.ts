import { Module } from '@nestjs/common';
import { PaymentManagementModule } from '../../loans/payments/payment-management/payment-management.module';
import { AppService } from '../../app.service';
import { InterestRateModule } from '../../loans/interest-rate/interest-rate.module';
import { MathExtModule } from '../../loans/mathext/mathext.module';
import { MathExtService } from '../../loans/mathext/mathext.service';
import { PracticeManagementModule } from '../../loans/practice-management/practice-management.module';
import { TransunionModule } from '../../loans/underwriting/transunion/transunion.module';
import { TransunionService } from '../../loans/underwriting/transunion/transunion.service';
import { LoggerService } from '../../logger/logger.service';
import { ScreenTrackingModule } from '../screen-tracking/screen-tracking.module';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { PaymentManagementService } from '../../loans/payments/payment-management/payment-management.service';
import { PaymentScheduleHistoryModule } from '../../loans/payments/payment-schedule-history/payment-schedule-history.module';
import { ConsentModule } from '../consent/consent.module';
import { CountersModule } from '../../counters/counters.module';
import { CountersService } from '../../counters/counters.service';

@Module({
  imports: [
    ScreenTrackingModule,
    PracticeManagementModule,
    PaymentScheduleHistoryModule,
    PaymentManagementModule,
    ConsentModule,
    CountersModule,
    TransunionModule,
    InterestRateModule,
    MathExtModule,
  ],
  controllers: [OffersController],
  providers: [
    OffersService,
    TransunionService,
    MathExtService,
    CountersService,
    PaymentManagementService,
    AppService,
    LoggerService,
  ],
})
export class OffersModule {}
