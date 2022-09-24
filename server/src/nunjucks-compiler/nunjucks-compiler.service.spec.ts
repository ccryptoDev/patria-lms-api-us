import { Test, TestingModule } from '@nestjs/testing';
import { NunjucksCompilerService } from './nunjucks-compiler.service';

describe('NunjucksCompilerService', () => {
  let service: NunjucksCompilerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NunjucksCompilerService],
    }).compile();

    service = module.get<NunjucksCompilerService>(NunjucksCompilerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
