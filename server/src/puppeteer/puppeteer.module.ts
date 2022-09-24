import { Module } from '@nestjs/common';

import { LoggerService } from '../logger/logger.service';
import { PuppeteerService } from './puppeteer.service';

@Module({
  providers: [PuppeteerService, LoggerService],
})
export class PuppeteerModule {}
