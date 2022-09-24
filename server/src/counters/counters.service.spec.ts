import { Test, TestingModule } from '@nestjs/testing';
import { CountersService } from './counters.service';
import { LoggerService } from '../logger/logger.service';
import { Counter, getCountersSeed } from './counters.schema';
import { getModelToken } from '@nestjs/mongoose';
import { TestRepository } from '../config/test/repository';
import { LoggerMockService } from '../logger/logger.mock.service';

describe('CountersService', () => {
  let service: CountersService;
  let repository: TestRepository<Counter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        {
          provide: getModelToken('Counter'),
          useValue: TestRepository.seed(getCountersSeed()),
        },
        CountersService,
      ],
    }).compile();

    service = module.get<CountersService>(CountersService);
    repository = module.get<TestRepository<Counter>>(getModelToken('Counter'));
  });

  it('should return the next numeric value which is a string', async () => {
    const type = 'user';
    const lastValue = (await repository.findOne({ appType: type }))
      .sequenceValue;

    const newValue = (
      await service.getNextSequenceValue(type, 'acf768c5af589caf687945')
    ).sequenceValue;
    expect(parseInt(newValue) - parseInt(lastValue)).toBe(1);
    expect(typeof newValue).toBe('string');
  });
});
