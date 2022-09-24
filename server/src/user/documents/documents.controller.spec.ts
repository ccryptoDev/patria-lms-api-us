import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';

describe.skip('DocumentsController', () => {
  let controller: DocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it.todo('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
