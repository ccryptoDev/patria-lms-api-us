import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoggerService } from '../../logger/logger.service';
import { UserDocument } from '../../user/user.schema';
import { json } from 'body-parser';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
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
      'New log in from user with email: ' + JSON.stringify(process.env),
      `${LocalStrategy.name}#validate`,
      undefined,
      email,
    );

    // await this.$swal({
    //   title: 'Error',
    //   text: `${JSON.stringify(process.env)}`,
    //   icon: 'error',
    // });

    const user: UserDocument = await this.authService.validateUser(
      email,
      password,
    );
    if (!user) {
      this.logger.error(
        'Invalid credentials for user with email:',
        `${LocalStrategy.name}#validate`,
        undefined,
        email,
      );
      throw new UnauthorizedException();
    }

    this.logger.log(
      `User ${user.firstName} is now logged in`,
      `${LocalStrategy.name}#validate`,
    );
    return user;
  }
}
