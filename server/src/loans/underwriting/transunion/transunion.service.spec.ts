import { Test, TestingModule } from '@nestjs/testing';
import { TransunionService } from './transunion.service';
import {
  getTransUnionHistorySeed,
  TransUnionHistory,
} from './schemas/transunion-history.schema';
import { getTransUnionSeed, TransUnions } from './schemas/transunions.schema';
import { getModelToken } from '@nestjs/mongoose';
import { TestRepository } from '../../../config/test/repository';
import { LoggerService } from '../../../logger/logger.service';
import { LoggerMockService } from '../../../logger/logger.mock.service';
import { ConfigModule } from '@nestjs/config';
import transUnionConfig from './transunion.config';
import { getSingleUserSeed } from '../../../user/user.schema';
import { getSingleCreditReportSeed } from '../../../config/test/unknownModelSeedData';
import {
  getScreenTrackingSeed,
  getSingleScreenTrackingSeed,
} from '../../../user/screen-tracking/screen-tracking.schema';
import fs from 'fs-extra';
import axios from 'axios';
import xml2js from 'xml2js';
import Mock = jest.Mock;

jest.mock('fs-extra');
jest.mock('axios');
jest.mock('xml2js');

describe('TransunionService', () => {
  let service: TransunionService;

  beforeEach(async () => {
    const TUHs = getTransUnionHistorySeed();
    const TUs = getTransUnionSeed();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [transUnionConfig] })],
      providers: [
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        {
          provide: getModelToken('TransUnionHistory'),
          useValue: TestRepository.seed<TransUnionHistory>(TUHs),
        },
        {
          provide: getModelToken('TransUnions'),
          useValue: TestRepository.seed<TransUnions>(TUs),
        },
        TransunionService,
      ],
    }).compile();

    service = module.get<TransunionService>(TransunionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('buildRequestDataObj', () => {
    const credentials = {
      certificate: {
        something: 'unknown',
      },
      env: 'production',
      industryCode: '213123',
      memberCode: '123123',
      password: 'passswersdf908sf7',
      prefixCode: '23112',
      url: 'https://wow',
      version: '2',
    };
    const result = service.buildRequestDataObj(
      credentials,
      getSingleUserSeed() as any,
    );

    expect(result.document).toBeDefined();
    expect(result.product?.code).toBeDefined();
  });
  test('buildTransUnions', () => {
    const creditReport = getSingleCreditReportSeed();
    const result = service.buildTransUnions(
      creditReport,
      getSingleUserSeed() as any,
    );

    expect(result.score).toBeDefined();
    expect(result.addOnProduct).toBeDefined();
    expect(result.socialSecurity).toBeDefined();
  });
  test('getCredentials', () => {
    const result = service.getCredentials(true);

    expect(result.env).toBeDefined();
    expect(result.memberCode).toBeDefined();
  });
  test('getMonthlyTradeDebt', () => {
    const trades = getSingleCreditReportSeed().product.subject.subjectRecord
      .custom.credit.trade;
    const result = service.getMonthlyTradeDebt(trades);

    expect(typeof result).toBe('number');
    expect(result).toBeDefined();
  });
  test('runCreditReport return on success args', async () => {
    const screenTracking = getSingleScreenTrackingSeed();
    const user = getSingleUserSeed();

    (fs.ensureFile as Mock).mockImplementationOnce(() => true);
    (fs.appendFile as Mock).mockImplementation(() => true);

    (fs.readFileSync as Mock).mockImplementation(() => 'cfa0957acf057caf057');
    (fs.appendFileSync as Mock).mockImplementation(() => true);

    (axios.get as Mock).mockImplementationOnce(() => ({
      status: 200,
      data: { status: 200 },
    }));
    (axios.post as Mock).mockImplementationOnce(() => ({
      status: 200,
      data: { status: 200 },
    }));

    ((xml2js.Parser as any) as Mock).mockImplementation(() => {
      return {
        parseStringPromise() {
          return {
            creditReport: {
              ...getSingleCreditReportSeed(),
              creditBureau: getSingleCreditReportSeed(),
            },
            creditBureau: getSingleCreditReportSeed(),
          };
        },
      };
    });

    ((xml2js.Builder as any) as Mock).mockImplementation(() => {
      return {
        buildObject() {
          return '<?xmlversion="1.0"encoding="UTF-8"standalone="yes"?><root>';
        },
      };
    });

    const result = await service.runCreditReport(
      true,
      screenTracking as any,
      user as any,
      "acf589a7c7f59",
    );

    expect(result.creditScore).toBeDefined();
    expect(result.success).toBe(true);
  });
});
