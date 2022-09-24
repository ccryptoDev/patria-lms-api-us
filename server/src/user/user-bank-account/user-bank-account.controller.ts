import { Controller } from '@nestjs/common';
import { UserBankAccountService } from './user-bank-account.service';

@Controller('user-bank-account')
export class UserBankAccountController {
  constructor(
    private readonly userBankAccountService: UserBankAccountService,
  ) {}
}
