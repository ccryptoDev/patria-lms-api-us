import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';

describe.skip('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it.todo('should be defined', () => {
    expect(service).toBeDefined();
  });
});
