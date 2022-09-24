import { Get, HttpCode, Param, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { Body } from '@nestjs/common';
import {
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../../logger/logger.service';

import { JwtAuthGuard } from '../../user/auth/jwt-auth.guard';
import { Role } from '../../user/auth/roles/role.enum';
import { Roles } from '../../user/auth/roles/roles.decorator';
import { RolesGuard } from '../../user/auth/roles/roles.guard';
import { PaymentCronService } from './payment-cron.service';
import { PaymentManagementService } from './payment-management/payment-management.service';
import { PaymentService } from './payment.service';
import { MakePaymentDto } from './validation/makePayment.dto';
import { Model } from 'mongoose';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../user/screen-tracking/screen-tracking.schema';
import { InjectModel } from '@nestjs/mongoose';
import { AuthController } from 'src/user/auth/auth.controller';
import { AdminJwtPayload } from 'src/user/auth/types/jwt-payload.types';
import { LoanSettingsService } from '../loan-settings/loan-settings.service';
import { AdminAuthGuard } from 'src/user/auth/admin-local-auth.guard';

// @UseGuards(JwtAuthGuard)
@Controller('/api')
export class PaymentController {
  constructor(
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    private readonly paymentService: PaymentService,
    private readonly paymentCronService: PaymentCronService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly logger: LoggerService,
    private readonly loanSettingsService: LoanSettingsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('test/automaticPayment')
  async runAutomaticPayments() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException();
    }

    try {
      await this.paymentCronService.makeAutomaticPayment();
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('application/makePayment')
  @UsePipes(new ValidationPipe())
  async makePayment(
    @Body() makePaymentDto: MakePaymentDto,
    @Req() request: Request,
  ) {
    const { amount, paymentMethodToken } = makePaymentDto;
    const { id: userId, screenTracking } = request.user;

    try {
      await this.paymentService.makeDownPayment(
        userId,
        screenTracking,
        amount,
        paymentMethodToken,
        request.id,
      );

      await this.paymentManagementService.setInRepaymentNonPrimeStatus(
        userId,
        request.id,
      );

      this.logger.log(
        'Response status 201:',
        `${PaymentController.name}#makePayment`,
        request.id,
      );
    } catch (error) {
      // Will only move the user forward in the application process when the down-payment goes through
      await this.screenTrackingModel.findOneAndUpdate(
        { user: userId },
        {
          lastLevel: 'repayment',
        },
      );
      this.logger.error(
        'Error:',
        `${PaymentController.name}#makePayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('application/getpaymentschedule/:token')
  async getPayments(@Req() request: Request, @Param('token') token: string) {
    this.logger.log(
      'Request params:',
      `${PaymentController.name}#getPayments`,
      request.id,
    );

    try {
      const stats = await this.paymentService.getPaymentSchedule(
        request,
        token,
      );

      this.logger.log(
        'Return data:',
        `${PaymentController.name}#getPayments`,
        request.id,
        stats,
      );

      return stats;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#getPayments`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Post('application/partialreturn')
  async partialReturnDetails(
    @Req() request: Request & { user: AdminJwtPayload },
    @Body('email') email: string,
    @Body('amount') amount: number,
  ) {
    try {
      await this.paymentService.partialReturnData(request, email, amount);
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#partialReturnDetails`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Post('application/movetocollections')
  async moveLoanCollections(
    @Body('email') email: string,
    @Body('status') status: string,
  ) {
    try {
      const loanSettings = await this.loanSettingsService.getLoanSettings();
      await this.paymentService.moveToCollection(
        email,
        status,
        loanSettings.delinquencyPeriod,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#moveToCollection`,
        'request.id',
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Post('application/assignloan')
  async assignLoan(@Body('email') email: [], @Body('admin') admin: string) {
    try {
      await this.paymentService.assignloan(email, admin);
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#assignLoan`,
        'request.id',
        error,
      );
      throw error;
    }
  }

  @HttpCode(204)
  @Post('application/assignloantome')
  async assignLoantome(
    @Body('email') email: [],
    @Body('adminid') adminid: string,
  ) {
    try {
      await this.paymentService.assignloantome(email, adminid);
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#assignLoan`,
        'request.id',
        error,
      );
      throw error;
    }
  }

  @Post('application/refundPayment')
  async refundPayment(@Body('token') token: string, @Req() request: Request) {
    try {
      await this.paymentService.refundPaymentData(request, token);
      this.logger.log(
        'Response status 201:',
        `${PaymentController.name}#refundPayment`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentController.name}#refundPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
