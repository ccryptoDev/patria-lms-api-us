import { Module } from '@nestjs/common';

import { LoggerService } from '../../logger/logger.service';
import { RequestLoggerService } from './request-logger.service';

@Module({
  providers: [RequestLoggerService, LoggerService],
  exports: [RequestLoggerService],
})
export class RequestLoggerModule {}
