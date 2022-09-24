import { Test, TestingModule } from '@nestjs/testing';
import { EsignatureService } from './esignature.service';

describe.skip('EsignatureService', () => {
  let service: EsignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EsignatureService],
    }).compile();

    service = module.get<EsignatureService>(EsignatureService);
  });

  it.todo('should be defined', () => {
    expect(service).toBeDefined();
  });
});
