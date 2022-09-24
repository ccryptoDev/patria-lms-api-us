import { Test, TestingModule } from '@nestjs/testing';
import { PracticeManagementService } from './practice-management.service';

describe.skip('PracticeManagementService', () => {
  let service: PracticeManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PracticeManagementService],
    }).compile();

    service = module.get<PracticeManagementService>(PracticeManagementService);
  });

  it.todo('should be defined', () => {
    expect(service).toBeDefined();
  });
});
