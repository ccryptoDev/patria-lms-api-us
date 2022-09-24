import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from './logger.service';
import { ConfigService } from "@nestjs/config";

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService, ConfigService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('instantiateLogger', () => {
    const logger = service.instantiateLogger();
    expect(logger).toBeDefined();
  });
});
