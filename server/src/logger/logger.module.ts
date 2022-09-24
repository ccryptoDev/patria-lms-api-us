import { Module } from '@nestjs/common';

import { LoggerService } from './logger.service';
import { RequestLoggerModule } from './request-logger/request-logger.module';

@Module({
  imports: [RequestLoggerModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
