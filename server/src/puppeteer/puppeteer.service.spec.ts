import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerService } from './puppeteer.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerMockService } from '../logger/logger.mock.service';
import puppeteer from 'puppeteer';
import Mock = jest.Mock;

jest.mock('puppeteer');

describe('PuppeteerService', () => {
  let service: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoggerService,
          useValue: LoggerMockService,
        },
        PuppeteerService,
      ],
    }).compile();

    service = module.get<PuppeteerService>(PuppeteerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('generatePDF', async () => {
    let waitForNavigaitonMock = jest.fn();
    let setContentMock = jest.fn();
    let pdfMock = jest.fn();
    let closeMock = jest.fn();

    const html = `<h1>Hello</h1>`;

    (puppeteer.launch as Mock).mockImplementation(() => {
      return Promise.resolve({
        async newPage() {
          return Promise.resolve({
            waitForNavigation: waitForNavigaitonMock,
            setContent: setContentMock,
            pdf: pdfMock,
          });
        },
        close: closeMock,
      });
    });

    const pdfPromise = await service.generatePDF(
      html,
      'path/to/',
      'caf057c70af8',
    );

    expect(pdfPromise).toBeUndefined();
    expect(waitForNavigaitonMock).toHaveBeenCalled();
    expect(setContentMock).toHaveBeenCalled();
    expect(setContentMock.mock.calls[0][0]).toBe(html);
    expect(pdfMock).toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalled();
  }, 8000); // test needs more time

  test('delay waits for given number of milliseconds', () => {
    jest.useFakeTimers();
    const numberOfMilliseconds = 400;
    const promise: Promise<any> = service.delay(numberOfMilliseconds);

    //first call, second arg
    expect(((setTimeout as any) as Mock).mock.calls[0][1]).toBe(400);
  });
});
