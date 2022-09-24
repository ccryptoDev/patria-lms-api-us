import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationLinkService } from './link.service';

describe.skip('LinkService', () => {
  let service: ApplicationLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationLinkService],
    }).compile();

    service = module.get<ApplicationLinkService>(ApplicationLinkService);
  });

  it.todo('should be defined', () => {
    expect(service).toBeDefined();
  });
});
