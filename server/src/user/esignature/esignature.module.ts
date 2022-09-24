import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Esignature, EsignatureSchema } from './esignature.schema';
import { EsignatureService } from './esignature.service';
import { EsignatureController } from './esignature.controller';
import { UserModule } from '../user.module';
import { ScreenTrackingModule } from '../screen-tracking/screen-tracking.module';
import { S3Module } from '../../s3/s3.module';
import { ConsentModule } from '../consent/consent.module';
import { LoggerService } from '../../logger/logger.service';
import { S3Service } from '../../s3/s3.service';
import { AppService } from '../../app.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Esignature.name, schema: EsignatureSchema },
    ]),
    forwardRef(() => UserModule),
    ScreenTrackingModule,
    S3Module,
    ConsentModule,
  ],
  exports: [MongooseModule],
  providers: [EsignatureService, LoggerService, S3Service, AppService],
  controllers: [EsignatureController],
})
export class EsignatureModule {}
