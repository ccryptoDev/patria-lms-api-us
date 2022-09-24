import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseSearchService } from './database-search.service';

describe('DatabaseSearchService', () => {
  let service: DatabaseSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseSearchService],
    }).compile();

    service = module.get<DatabaseSearchService>(DatabaseSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
