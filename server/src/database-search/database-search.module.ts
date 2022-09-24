import { Module } from '@nestjs/common';
import { DatabaseSearchService } from './database-search.service';

@Module({
  providers: [DatabaseSearchService],
  exports: [DatabaseSearchService],
})
export class DatabaseSearchModule {}
