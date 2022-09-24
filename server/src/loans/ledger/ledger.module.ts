import { Module } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { LedgerService } from './ledger.service';

@Module({
  providers: [LedgerService, LoggerService],
  exports: [LedgerService],
})
export class LedgerModule {}
