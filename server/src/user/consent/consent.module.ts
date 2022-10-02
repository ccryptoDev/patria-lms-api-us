import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserConsent, UserConsentSchema } from './consent.schema';
import { ConsentService } from './consent.service';
import { ScreenTrackingModule } from '../screen-tracking/screen-tracking.module';
import { PaymentManagementModule } from '../../loans/payments/payment-management/payment-management.module';
import { S3Service } from '../../s3/s3.service';
import { PuppeteerService } from '../../puppeteer/puppeteer.service';
import { AgreementModule } from '../../loans/agreement/agreement.module';
import { S3Module } from '../../s3/s3.module';
import { PuppeteerModule } from '../../puppeteer/puppeteer.module';
import { LoggerService } from '../../logger/logger.service';
import { AppService } from '../../app.service';
import { NunjucksCompilerModule } from '../../nunjucks-compiler/nunjucks-compiler.module';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { ConsentController } from './consent.controller';
import { UserModule } from '../user.module';
import { LoanpaymentproModule } from '../../loans/payments/loanpaymentpro/loanpaymentpro.module';
import { EsignatureModule } from '../esignature/esignature.module';
import { LogActivityModule } from '../log-activity/log-activity.module';
import { LogActivityService } from '../log-activity/log-activity.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserConsent.name, schema: UserConsentSchema },
    ]),
    ScreenTrackingModule,
    LoanpaymentproModule,
    AgreementModule,
    PuppeteerModule,
    S3Module,
    forwardRef(() => EsignatureModule),
    forwardRef(() => PaymentManagementModule),
    NunjucksCompilerModule,
    forwardRef(() => UserModule),
    LogActivityModule,
  ],
  providers: [
    ConsentService,
    PuppeteerService,
    S3Service,
    NunjucksCompilerService,
    AppService,
    LoggerService,
    LogActivityService,
  ],
  exports: [MongooseModule, LogActivityService],
  controllers: [ConsentController],
})
export class ConsentModule { }
