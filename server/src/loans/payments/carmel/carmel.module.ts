import { forwardRef, Module } from '@nestjs/common';
import { CarmelService } from './carmel.service';
import { CarmelController } from './carmel.controller';
import { LoggerService } from '../../../logger/logger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import carmelConfig from './carmel.config';
import { CountersModule } from 'src/counters/counters.module';
import { PaymentManagementModule } from '../payment-management/payment-management.module';
import { PaymentScheduleHistoryModule } from '../payment-schedule-history/payment-schedule-history.module';
import { PracticeManagementModule } from 'src/loans/practice-management/practice-management.module';
import { ScreenTrackingModule } from 'src/user/screen-tracking/screen-tracking.module';
import { PaymentOrderDto } from './dto/payment-order.dto';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [carmelConfig] }),
    MongooseModule.forFeature([]),
    forwardRef(() => PaymentManagementModule),
    forwardRef(() => PaymentOrderDto),
    PaymentScheduleHistoryModule,
  ],
  providers: [CarmelService, PaymentOrderDto, LoggerService],
  controllers: [CarmelController],
  exports: [MongooseModule, PaymentOrderDto],
})
export class CarmelModule {}
