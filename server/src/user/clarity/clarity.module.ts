import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerService } from '../../logger/logger.service';
import { ClarityController } from './clarity.controller';
import { ClarityService } from './clarity.service';
import { ClarityResponse, ClarityResponseSchema } from './clarity.schema';
import { UserModule } from '../user.module';
import { ScreenTrackingModule } from '../screen-tracking/screen-tracking.module';
import { LogActivityModule } from '../log-activity/log-activity.module';
import { LogActivityService } from '../log-activity/log-activity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClarityResponse.name, schema: ClarityResponseSchema },
    ]),
    forwardRef(() => UserModule),
    ScreenTrackingModule,
    LogActivityModule,
  ],
  exports: [MongooseModule, LogActivityModule],
  providers: [ClarityService, LoggerService, LogActivityService],
  controllers: [ClarityController],
})
export class ClarityModule { }
