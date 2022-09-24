import { Test, TestingModule } from '@nestjs/testing';
import { UserBankAccountController } from './user-bank-account.controller';
import { UserBankAccountService } from './user-bank-account.service';

describe('UserBankAccountController', () => {
  let controller: UserBankAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBankAccountController],
      providers: [UserBankAccountService],
    }).compile();

    controller = module.get<UserBankAccountController>(
      UserBankAccountController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
