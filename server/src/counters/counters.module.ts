import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LoggerService } from '../logger/logger.service';
import { Counter, CountersSchema } from './counters.schema';
import { CountersService } from './counters.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CountersSchema }]),
  ],
  providers: [CountersService, LoggerService],
  exports: [MongooseModule, CountersService],
})
export class CountersModule {}
