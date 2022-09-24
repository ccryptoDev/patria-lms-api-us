import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../logger/logger.service';
import { CarmelService } from './carmel.service';
import { PaymentOrderDto } from './dto/payment-order.dto';
import { LoggerMockService } from '../../../logger/logger.mock.service';

describe('CarmelService', () => {
  const mockConfigService = jest.fn().mockImplementation((configProp) => {
    // return 'test';
    switch (configProp) {
      case 'clientId':
        return '21o5so66fuvqmnif02dbortspe';
      case 'clientSecret':
        return '21o5so66fuvqmnif02dbortspe';
      case 'baseUrl':
        return 'https://api.carmelsolutions.com/api/v1';
      case 'authHost':
        'https://auth.carmelsolutions.com';
      case 'authPath':
        '/oauth2/token';
      case 'scope':
        return 'https://api.carmelsolutions.com/pay';
      default:
        throw new Error('Unexpected configProp');
    }
  });

  let service: CarmelService;

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
            get: mockConfigService,
          },
        },
        CarmelService,
        PaymentOrderDto,
      ],
    }).compile();

    service = module.get<CarmelService>(CarmelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    try {
      await expect(
        service.createPaymentOrder('any', {}),
      ).resolves.toBeDefined();
    } catch (err) {
      console.log(err);
    }
  });

  describe('getOauthToken', () => {
    it('should return oauth2 token', async () => {
      await expect(
        service
          .getOauthToken()
          .then((res) => expect(res.split('.').length).toBe(3)),
      ).resolves.not.toThrowError();
    });
  });
});
