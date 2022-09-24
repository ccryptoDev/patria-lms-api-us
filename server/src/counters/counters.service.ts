import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LoggerService } from '../logger/logger.service';
import { Counter, CountersDocument } from './counters.schema';

@Injectable()
export class CountersService {
  constructor(
    @InjectModel(Counter.name)
    private readonly applicationReferenceModel: Model<CountersDocument>,
    private readonly logger: LoggerService,
  ) {}

  async getNextSequenceValue(sequenceName: string, requestId: string) {
    this.logger.log(
      'Generating next sequence value with params:',
      `${CountersService.name}#getNextSequenceValue`,
      requestId,
      { sequenceName },
    );

    const existingCounter = await this.applicationReferenceModel.findOne({
      appType: sequenceName,
    });

    let result: CountersDocument;
    if (!existingCounter) {
      const newCounter = await this.applicationReferenceModel.create({
        appType: sequenceName,
        sequenceValue: '1',
      });
      result = newCounter;
    } else {
      existingCounter.sequenceValue = +existingCounter.sequenceValue + 1 + '';
      await existingCounter.save();

      result = existingCounter;
    }

    this.logger.log(
      'Next sequence value generated',
      `${CountersService.name}#getNextSequenceValue`,
      requestId,
      result,
    );

    return result;
  }
}
