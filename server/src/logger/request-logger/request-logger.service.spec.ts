import { Test, TestingModule } from '@nestjs/testing';

import { RequestLoggerService } from './request-logger.service';
import { LoggerService } from '../logger.service';
import { LoggerMockService } from '../logger.mock.service';

describe('RequestLoggerService', () => {
  let service: RequestLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        RequestLoggerService,
      ],
    }).compile();

    service = module.get<RequestLoggerService>(RequestLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('use', () => {
    const req = {
      protocol: 'protocol',
      headers: 'headers',
      method: 'method',
      body: 'body',
      query: 'query',
      originalUrl: 'originalUrl',
      connection: 'connection',
      id: undefined,
      get(header) {
        return `${header}: fdc449fdc68cfd496a8`;
      },
    };
    const mock = jest.fn();
    service.use(req as any, {} as any, mock);

    expect(mock).toHaveBeenCalled();
    expect(req.id).toBeDefined();
  });
});
