import { Module } from '@nestjs/common';

import { LoggerService } from '../../logger/logger.service';
import { MathExtService } from './mathext.service';

@Module({
  providers: [MathExtService, LoggerService],
  exports: [MathExtService],
})
export class MathExtModule {}
