import twilioConfig from './twilio.config';
import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from './twilio.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import { LoggerMockService } from '../logger/logger.mock.service';
import { sendTextMessageDto } from './validation/sendTextMessage.dto';
import Twilio from 'twilio';
import Mock = jest.Mock;

jest.mock('twilio');

describe('TwilioService', () => {
  let service: TwilioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [twilioConfig] })],
      providers: [
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        TwilioService,
      ],
    }).compile();

    service = module.get<TwilioService>(TwilioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('sendTextMessage', async () => {
    const message: sendTextMessageDto = {
      message: 'Hello',
      to: 'f07c8d0ac7d58',
    };

    const createMock = jest
      .fn()
      .mockImplementation((data) => Promise.resolve(data));

    ((Twilio as any) as Mock).mockReturnValue({
      messages: {
        create: createMock,
      },
    });

    const result = await service.sendTextMessage(message, 'fc89a6069');
    expect(createMock).toHaveBeenCalled();
  });
});
