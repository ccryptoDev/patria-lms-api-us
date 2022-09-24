import { Test, TestingModule } from '@nestjs/testing';
import { CarmelController } from './carmel.controller';
import { CarmelService } from './carmel.service';

describe('CarmelController', () => {
  let controller: CarmelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarmelController],
      providers: [CarmelService],
    }).compile();

    controller = module.get<CarmelController>(CarmelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
