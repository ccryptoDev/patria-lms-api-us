import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TwilioService } from './twilio.service';
import twilioConfig from './twilio.config';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [twilioConfig] })],
  providers: [TwilioService, LoggerService],
  exports: [TwilioService],
})
export class TwilioModule {}
