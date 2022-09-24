import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { User, UserSchema } from './user.schema';
import { LoggerService } from '..//logger/logger.service';
import { RolesModule } from './roles/roles.module';
import { StateModule } from './state/state.module';
import { ActivityModule } from './activity/activity.module';
import { ScreenTrackingModule } from './screen-tracking/screen-tracking.module';
import { ActivityService } from './activity/activity.service';
import { CountersService } from '../counters/counters.service';
import { CountersModule } from '../counters/counters.module';
import { ApplicationModule } from './application/application.module';
import { ConsentModule } from './consent/consent.module';
import { EsignatureModule } from './esignature/esignature.module';
import { OffersModule } from './offers/offers.module';
import { DocumentsModule } from './documents/documents.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AppService } from '../app.service';
import { AdminModule } from './admin/admin.module';
import { UserController } from './user.controller';
import { PaymentManagementModule } from '../loans/payments/payment-management/payment-management.module';
import { PracticeManagementModule } from '../loans/practice-management/practice-management.module';
import { LogActivityModule } from './log-activity/log-activity.module';
import { AuthModule } from './auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { S3Service } from '../s3/s3.service';
import { EmploymentHistoryModule } from './employment-history/employment-history.module';
import { UserBankAccountModule } from './user-bank-account/user-bank-account.module';
import { ClarityController } from './clarity/clarity.controller';
import { ClarityService } from './clarity/clarity.service';
import { ClarityModule } from './clarity/clarity.module';

@Module({
  imports: [
    ActivityModule,
    forwardRef(() => AdminModule),
    AuthModule,
    ConsentModule,
    CountersModule,
    DashboardModule,
    DocumentsModule,
    EsignatureModule,
    forwardRef(() => ApplicationModule),
    LogActivityModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OffersModule,
    PaymentManagementModule,
    PracticeManagementModule,
    RolesModule,
    ScreenTrackingModule,
    StateModule,
    S3Module,
    EmploymentHistoryModule,
    UserBankAccountModule,
    ClarityModule,
  ],
  providers: [
    ActivityService,
    AppService,
    CountersService,
    LoggerService,
    UserService,
    S3Service,
    ClarityService,
  ],
  exports: [MongooseModule, UserService],
  controllers: [UserController, ClarityController],
})
export class UserModule {}
