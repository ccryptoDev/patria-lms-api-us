import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import mandrilConfig from './mandril.config';
import { MandrillService } from './mandrill.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [mandrilConfig] })],
  providers: [MandrillService, LoggerService],
  exports: [MandrillService],
})
export class MandrillModule { }
