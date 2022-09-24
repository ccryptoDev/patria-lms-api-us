import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';

describe.skip('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it.todo('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
