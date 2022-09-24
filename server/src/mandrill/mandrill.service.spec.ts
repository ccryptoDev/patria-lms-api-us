import { Test, TestingModule } from '@nestjs/testing';
import { MandrillService } from './mandrill.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMockService } from '../logger/logger.mock.service';
import { SendEmailDto } from './validation/sendEmail.dto';
import mandrilConfig from './mandril.config';

describe('MandrillService', () => {
  let service: MandrillService;
  let mailMock: any;
  let mandRillResponse: any;

  beforeEach(async () => {
    mandRillResponse = 'mandrillResponse';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useFactory() {
            mailMock = jest.fn().mockImplementation((mail, cb) => {
              cb(null, mandRillResponse);
            });
            return {
              get() {
                return {
                  sendMail: mailMock,
                };
              },
            };
          },
        },
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        MandrillService,
      ],
    }).compile();

    service = module.get<MandrillService>(MandrillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('sendEmail', async () => {
    const emailContent: SendEmailDto = {
      from: 'acf097cf057c',
      to: 'dsf097cf057c',
      subject: 'testing mandrill',
      html: '<h1>Hello test</h1>',
    };
    const result = await service.sendEmail(emailContent, 'fcda70cfd75d57');

    expect(result).toBe(mandRillResponse);
    expect(mailMock).toHaveBeenCalled();
  });
});
