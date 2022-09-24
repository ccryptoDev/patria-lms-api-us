import { Test, TestingModule } from '@nestjs/testing';
import { ClarityController } from './clarity.controller';

describe('ClarityController', () => {
  let controller: ClarityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClarityController],
    }).compile();

    controller = module.get<ClarityController>(ClarityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
