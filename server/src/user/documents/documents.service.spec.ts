import { Test, TestingModule } from '@nestjs/testing';
import { UserDocumentsService } from './documents.service';

describe.skip('DocumentsService', () => {
  let service: UserDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDocumentsService],
    }).compile();

    service = module.get<UserDocumentsService>(UserDocumentsService);
  });

  it.todo('should be defined', () => {
    expect(service).toBeDefined();
  });
});
