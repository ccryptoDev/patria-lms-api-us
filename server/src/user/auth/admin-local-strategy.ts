import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoggerService } from '../../logger/logger.service';
import { AdminDocument } from '../admin/admin.schema';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(
  Strategy,
  'admin-strategy',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * Validate a user with email and password
   * @param email User's email
   * @param password User's password
   */
  async validate(email: string, password: string): Promise<any> {
    this.logger.log(
      'New log in from admin user with email:',
      `${AdminLocalStrategy.name}#validate`,
      undefined,
      email,
    );
    const user: AdminDocument = await this.authService.validateAdminUser(
      email,
      password,
    );
    if (!user) {
      this.logger.error(
        'Invalid credentials for admin user with email:',
        `${AdminLocalStrategy.name}#validate`,
        undefined,
        email,
      );
      throw new UnauthorizedException();
    }

    this.logger.log(
      `Admin user ${user.userName} is now logged in`,
      `${AdminLocalStrategy.name}#validate`,
    );
    return user;
  }
}
