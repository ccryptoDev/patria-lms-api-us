import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from '../../app.service';
import { S3Service } from '../../s3/s3.service';
import { LoggerService } from '../../logger/logger.service';
import { UserModule } from '../user.module';
import { DocumentsController } from './documents.controller';
import { UserDocuments, UserDocumentsSchema } from './documents.schema';
import { UserDocumentsService } from './documents.service';
import { ScreenTrackingService } from '../screen-tracking/screen-tracking.service';
import { PaymentManagementService } from '../../loans/payments/payment-management/payment-management.service';
import { PaymentManagementModule } from '../../loans/payments/payment-management/payment-management.module';
import { ScreenTrackingModule } from '../screen-tracking/screen-tracking.module';
import { PaymentScheduleHistoryModule } from '../../loans/payments/payment-schedule-history/payment-schedule-history.module';
import { ConsentModule } from '../consent/consent.module';
import { MathExtModule } from '../../loans/mathext/mathext.module';
import { CountersService } from '../../counters/counters.service';
import { CountersModule } from '../../counters/counters.module';
import { LedgerModule } from '../../loans/ledger/ledger.module';
import { LogActivityModule } from '../log-activity/log-activity.module';
import { LogActivityService } from '../log-activity/log-activity.service';
import { DatabaseSearchModule } from '../../database-search/database-search.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocuments.name, schema: UserDocumentsSchema },
    ]),
    forwardRef(() => UserModule),
    ConsentModule,
    CountersModule,
    DatabaseSearchModule,
    LedgerModule,
    LogActivityModule,
    MathExtModule,
    PaymentManagementModule,
    PaymentScheduleHistoryModule,
    ScreenTrackingModule,
  ],
  controllers: [DocumentsController],
  providers: [
    AppService,
    CountersService,
    LogActivityService,
    LoggerService,
    PaymentManagementService,
    S3Service,
    ScreenTrackingService,
    UserDocumentsService,
  ],
  exports: [MongooseModule],
})
export class DocumentsModule {}
