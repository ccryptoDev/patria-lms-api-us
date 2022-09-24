import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../logger/logger.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

import { UserService } from './user.service';

@Controller('/api/application')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getApplicationInformation(@Req() request: Request) {
    const screenTracking: string = request.user.screenTracking;
    try {
      const response = await this.userService.getApplicationInformation(
        screenTracking,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${UserController.name}#getApplicationInformation`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${UserController.name}#getApplicationInformation`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('application-data')
  async getApplicationData(@Req() request: Request) {
    
   }
}
