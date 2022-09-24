import { Test, TestingModule } from '@nestjs/testing';

import { ActivityService } from './activity.service';
import { getModelToken } from '@nestjs/mongoose';
import { TestRepository } from '../../config/test/repository';
import { getCountersSeed } from '../../counters/counters.schema';
import { getUserActivitySeed } from './activity.schema';
import { LoggerService } from '../../logger/logger.service';
import { LoggerMockService } from '../../logger/logger.mock.service';

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(async () => {
    const UAs = getUserActivitySeed();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken('UserActivity'),
          useValue: TestRepository.seed(UAs),
        },
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        ActivityService,
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('createUserActivity', async () => {
    const data = {
      userId: 'fc8a9d6',
      logData: 'Hello, log it, please',
    };
    const subject = 'Some subj';
    const description = 'description';
    const requestId = 'cf0a78cfa570';

    const result = await service.createUserActivity(
      data,
      subject,
      description,
      requestId,
    );

    expect(result.user).toBeDefined();
    expect(result.logData).toBeDefined();
    expect(result.subject).toBeDefined();
  });
});
