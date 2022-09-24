import { Test, TestingModule } from '@nestjs/testing';
import { EsignatureController } from './esignature.controller';

describe.skip('EsignatureController', () => {
  let controller: EsignatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EsignatureController],
    }).compile();

    controller = module.get<EsignatureController>(EsignatureController);
  });

  it.todo('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
