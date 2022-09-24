import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerService } from '../../logger/logger.service';
import { ClarityController } from './clarity.controller';
import { ClarityService } from './clarity.service';
import { ClarityResponse, ClarityResponseSchema } from './clarity.schema';
import { UserModule } from '../user.module';
import { ScreenTrackingModule } from '../screen-tracking/screen-tracking.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClarityResponse.name, schema: ClarityResponseSchema },
    ]),
    forwardRef(() => UserModule),
    ScreenTrackingModule,
  ],
  exports: [MongooseModule],
  providers: [ClarityService, LoggerService],
  controllers: [ClarityController],
})
export class ClarityModule {}
