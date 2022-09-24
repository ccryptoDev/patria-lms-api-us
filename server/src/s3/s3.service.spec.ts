import { Test, TestingModule } from '@nestjs/testing';

import { S3Service } from './s3.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerMockService } from '../logger/logger.mock.service';
import { ConfigService } from '@nestjs/config';
import Mock = jest.Mock;

describe('S3Service', () => {
  let service: S3Service;
  let uploadMock = jest.fn().mockReturnValue({
    promise() {
      return Promise.resolve(0);
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        {
          provide: ConfigService,
          useValue: {
            get(configProp) {
              if (configProp === 's3Client') {
                return {
                  // client
                  upload: uploadMock,
                };
              } else {
                return 'fac075fac';
              }
            },
          },
        },
        S3Service,
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('getS3Url', () => {
    const result = service.getS3Url('some/path');
    expect(typeof result).toBe('string');
  });

  test('uploadFile', async () => {
    const result = await service.uploadFile(
      '/some/path',
      new Buffer('test'),
      'image/jpeg',
      'fac0758acf5708afc5',
    );

    expect(result).toBeDefined();
    expect(uploadMock).toHaveBeenCalled();
  });
});
