import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { getModelToken } from '@nestjs/mongoose';
import { TestRepository } from '../../config/test/repository';
import {
  getScreenTrackingSeed,
  getSingleScreenTrackingSeed,
} from '../screen-tracking/screen-tracking.schema';
import { getPracticeManagementSeed } from '../../loans/practice-management/practice-management.schema';
import { getLoanInterestRageSeed } from '../../loans/interest-rate/interest-rate.schema';
import { LoggerService } from '../../logger/logger.service';
import { LoggerMockService } from '../../logger/logger.mock.service';
import { MathExtService } from '../../loans/mathext/mathext.service';
import { TransunionService } from '../../loans/underwriting/transunion/transunion.service';
import { TransunionMockService } from '../../loans/underwriting/transunion/transunion.mock.service';
import { OffersDto } from './validation/offers.dto';
import { getSingleUserSeed } from '../user.schema';
import { getTransUnionSeed } from '../../loans/underwriting/transunion/schemas/transunions.schema';

describe('OffersService', () => {
  let service: OffersService;

  beforeEach(async () => {
    const SingleUserSeed = getSingleUserSeed();
    const SingleTUSeed = getTransUnionSeed()[0];

    const STs = getScreenTrackingSeed();
    const PMs = getPracticeManagementSeed();
    const LIRs = getLoanInterestRageSeed();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken('ScreenTracking'),
          useValue: TestRepository.seed(STs).PopulateSeedData(
            'user',
            SingleUserSeed,
          ),
        },
        {
          provide: getModelToken('PracticeManagement'),
          useValue: TestRepository.seed(PMs),
        },
        {
          provide: getModelToken('LoanInterestRate'),
          useValue: TestRepository.seed(LIRs),
        },
        {
          provide: TransunionService,
          useValue: new TransunionMockService(),
        },
        MathExtService,
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        OffersService,
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('approvedUpToOffers', async () => {
    const offerDto: OffersDto = {
      screenTrackingId: '86cf9dcf8a6d5',
      loanAmount: 5000,
      requestedLoanAmount: 5000,
    };

    jest.spyOn(service, 'getPracticeOffers').mockReturnValue(
      Promise.resolve({
        declineReasons: [],
        offers: [{ maxLoanAmt: 10000, minLoanAmt: 400 }],
        preDTI: {
          monthlyAmount: 300,
          percent: 14,
        },
      } as any),
    );
    const result = await service.approvedUpToOffers(offerDto, 'afc-8af-c-fca');

    expect(result).toBeDefined();
    expect(result.status).toBe('Approved');
  });
  test('aprRateCalculator', async () => {
    const options = {
      fv: 12,
      guess: 100,
      loanAmount: 3000,
      downPayment: 300,
      payment: 320,
      term: 24,
      type: 1,
    };

    const result = await service.aprRateCalculator(options, 'afaf86af689');

    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });
  test('calcMonthlyPayment', async () => {
    const result = await service.calcMonthlyPayment(
      1,
      3000,
      300,
      24,
      'afaf86af689',
    );

    expect(result).toBeDefined();
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(typeof result.monthlyPayment).toBe('number');
    expect(result.financeCharge).toBeGreaterThan(0);
  });
  test('getDeclineMsgs', async () => {
    const options = {
      stateCode: 'TX',
      neededDTI: 13,
      loanAmount: 3000,
      maxCreditScore: 83,
      maxLoanAmount: 7000,
      minCreditScore: 14,
      minLoanAmount: 2000,
      postDTI: 11,
      dti: 33,
      creditScore: 55,
    };

    const result = await service.getDeclineMsgs(options, 'afa8f9fa8');

    expect(Array.isArray(result)).toBe(true);
    expect(typeof result[0].msg).toBe('string');
  });

  test('getPracticeOffers', async () => {
    const ST = getSingleScreenTrackingSeed() as any;
    const result = await service.getPracticeOffers(3000, ST, 'af-fa6af6af0756');

    expect(result).toBeDefined();
  });
});
