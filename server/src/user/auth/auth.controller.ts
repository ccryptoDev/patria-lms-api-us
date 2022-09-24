import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../../logger/logger.service';
import { AdminAuthGuard } from './admin-local-auth.guard';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { MandrillService } from '../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './validation/change-password.dto';
import { AdminJwtPayload } from './types/jwt-payload.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminForgotPasswordDto } from './validation/admin-forgot-password.dto';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../log-activity/log-activity.service';

@Controller('/api')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
    private readonly mailService: MandrillService,
    private readonly nunjucksService: NunjucksCompilerService,
    private readonly configService: ConfigService,
    private readonly logActivityService: LogActivityService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('application/login')
  async login(@Req() request: any) {
    try {
      console.log('\n\n=====ffffffffff===\n\n');
      const response: {
        token: string;
        role: string;
      } = await this.authService.generateJwt(request.user, request.id);
      this.logger.log(
        'Response status 201',
        `${AuthController.name}#login`,
        undefined,
        response,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#login`,
        undefined,
        error,
      );
      throw error;
    }
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/login')
  async adminLogin(@Req() request: any) {
    try {
      const response: {
        token: string;
        role: string;
      } = await this.authService.generateJwt(request.user, request.id);

      const {
        _id,
        userName,
        email,
        phoneNumber,
        role,
        roleName,
        createdAt,
        practiceManagement,
      } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.LOGIN,
        `${request.user.email} - User logged in`,
        {
          _id,
          createdAt,
          email,
          phoneNumber,
          role,
          roleName,
          userName,
          practiceManagementId: practiceManagement,
        },
      );

      this.logger.log(
        'Response status 201',
        `${AuthController.name}#adminLogin`,
        undefined,
        response,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#adminLogin`,
        undefined,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Patch('application/updateCustomerData')
  async updateCustomerData(
    @Req() request: Request,
    @Body('token') email: string,
    @Body('ssn') ssnNumber: string,
    @Body('annualIncome') annualIncome: string,
  ) {
    try {
      const response = await this.authService.updateCustomerData(
        request,
        email,
        ssnNumber,
        annualIncome,
      );

      this.logger.log(
        'Response status 204',
        `${AuthController.name}#updateCustomerData`,
        request.id,
        response,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#updateCustomerData`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @HttpCode(204)
  @Post('application/closeLoanDetails')
  async closeLoanDetails(
    @Req() request: Request & { user: AdminJwtPayload },
    @Body('email') email: string,
  ) {
    try {
      const response = await this.authService.generateCustomerUpdateToken(
        email,
        request.id,
      );

      if (!response) {
        return;
      }

      const { user, token } = response;
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-closeloan.html',
        {
          userName: user.firstName,
          link: `${baseUrl}/closeloandetails/${token}`,
        },
      );
      const subject = 'Closing Loan Request';
      const from = 'no-reply@patrialending.com';
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, request.id);

      this.logger.log(
        'Response status 204',
        `${AuthController.name}#updateCustomerDetails`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#updateCustomerDetails`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Post('application/updatecustomerdetails')
  async updateCustomerDetails(
    @Req() request: Request & { user: AdminJwtPayload },
    @Body('email') email: string,
  ) {
    try {
      const response = await this.authService.generateCustomerUpdateToken(
        email,
        request.id,
      );

      if (!response) {
        return;
      }

      const { user, token } = response;
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-updateinfo.html',
        {
          userName: user.firstName,
          link: `${baseUrl}/update-customerdetails/${token}`,
        },
      );
      const subject = 'Update SSN/Annual income Request';
      const from = 'no-reply@patrialending.com';
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, request.id);

      this.logger.log(
        'Response status 204',
        `${AuthController.name}#updateCustomerDetails`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#updateCustomerDetails`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Post('application/forgotPassword')
  async forgotPassword(
    @Req() request: Request & { user: AdminJwtPayload },
    @Body('email') email: string,
  ) {
    try {
      const response = await this.authService.generateResetPasswordToken(
        email,
        request.id,
      );

      if (!response) {
        return;
      }

      const { user, token } = response;
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/forgot-password.html',
        {
          userName: user.firstName,
          link: `${baseUrl}/reset-password/${token}`,
        },
      );
      const subject = 'Password reset request';
      const from = 'no-reply@patrialending.com';
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, request.id);

      this.logger.log(
        'Response status 204',
        `${AuthController.name}#forgotPassword`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#forgotPassword`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Patch('application/resetPassword/:token')
  async resetPassword(
    @Req() request,
    @Param('token') token: string,
    @Body('password') newPassword: string,
  ) {
    try {
      const response = await this.authService.resetPasswordByToken(
        token,
        newPassword,
        request.id,
      );

      this.logger.log(
        'Response status 204',
        `${AuthController.name}#setPassword`,
        request.id,
        response,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#setPassword`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @Patch('application/changePassword')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() request: Request,
    @Body(new ValidationPipe()) adminChangePasswordDto: ChangePasswordDto,
  ) {
    try {
      await this.authService.changePassword(
        request.user.id,
        adminChangePasswordDto.existingPassword,
        adminChangePasswordDto.newPassword,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${AuthController.name}#changePassword`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#changePassword`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @Patch('admin/changePassword')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async adminChangePassword(
    @Req() request: Request,
    @Body(new ValidationPipe()) adminChangePasswordDto: ChangePasswordDto,
  ) {
    try {
      await this.authService.adminChangePassword(
        request.user.id,
        adminChangePasswordDto.existingPassword,
        adminChangePasswordDto.newPassword,
        request.id,
      );
      this.logger.log(
        'Response status 204',
        `${AuthController.name}#changePassword`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#changePassword`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @Patch('admin/forgotPassword')
  @HttpCode(204)
  async adminForgotPassword(
    @Req() request: Request,
    @Body(new ValidationPipe()) adminForgotPasswordDto: AdminForgotPasswordDto,
  ) {
    try {
      await this.authService.adminForgotPassword(
        adminForgotPasswordDto,
        request.id,
      );

      this.logger.log(
        'Response status 204',
        `${AuthController.name}#adminForgotPassword`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AuthController.name}#adminForgotPassword`,
        request.id,
        error,
      );

      throw error;
    }
  }
}
