import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from '../../user/user.schema';
import { LoggerService } from '../../logger/logger.service';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import {
  PaymentScheduleHistory,
  PaymentScheduleHistoryDocument,
} from '../../loans/payments/payment-schedule-history/payment-schedule-history.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { MakePaymentDialogPipe } from '../../loans/admin-dashboard/pipes/makePaymentDialog.pipe';
import { MakePaymentDialogDto } from '../../loans/admin-dashboard/dtos/makePaymentDialog.dto';
import { SubmitPaymentDto } from '../../loans/admin-dashboard/dtos/submit-payment.dto';
import { ChangePaymentAmountDto } from '../../loans/admin-dashboard/dtos/change-payment-amount.dto';
import { EnableAutopayDto } from '../../loans/admin-dashboard/dtos/enable-autopay.dto';
import { PaymentService } from '../../loans/payments/payment.service';
import moment from 'moment';

@UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class DashboardController {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(PaymentScheduleHistory.name)
    private readonly paymentScheduleHistoryModel: Model<PaymentScheduleHistoryDocument>,
    private readonly paymentService: PaymentService,
    private readonly dashboardService: DashboardService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) {}

  @Get('dashboard')
  @UsePipes(new ValidationPipe())
  async getDashboard(@Req() request: Request) {
    const userId = request.user.id;
    try {
      const response = await this.dashboardService.getDashboard(
        userId,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#getDashboard`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#getDashboard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('dashboard/previewPayment')
  @UsePipes(new ValidationPipe())
  async previewPayment(
    @Body(new MakePaymentDialogPipe()) makePaymentDto: MakePaymentDialogDto,
    @Req() request: Request,
  ) {
    try {
      const response = await this.paymentService.makePaymentRenderDialog(
        makePaymentDto,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#previewPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#previewPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('dashboard/submitPayment')
  @UsePipes(new ValidationPipe())
  async submitPayment(
    @Body(new MakePaymentDialogPipe()) submitPaymentDto: SubmitPaymentDto,
    @Req() request: Request,
  ) {
    const screenTrackingId = submitPaymentDto.screenTracking;
    try {
      const response = await this.paymentService.submitPayment(
        submitPaymentDto,
        request.id,
      );

      const userInfo = request.user;
      if (response) {
        await this.logActivityService.createLogActivityUpdateUser(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${userInfo.email} - ${userInfo.role} Made payment with amount ${response.amount}. Payment reference ${response.paymentReference}. Payment id ${response._id}`,
          {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
            userName: userInfo.firstName + userInfo.lastName,
            screenTrackingId,
            paymentId: response._id,
            paymentManagementId: response.paymentManagement as string,
            paymentStatus: response.status,
            customerPracticeManagementId: response.practiceManagement as string,
          },
          screenTrackingId,
          userInfo.id,
        );
      } else {
        await this.logActivityService.createLogActivityUpdateUser(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${userInfo.email} - ${userInfo.role} Scheduled payment for ${moment(
            submitPaymentDto.paymentDate,
          ).format('MM/DD/YYYY')} with amount ${submitPaymentDto.amount}`,
          {
            id: userInfo.id,
            email: userInfo.email,
            role: userInfo.role,
            userName: userInfo.firstName + userInfo.lastName,
            screenTrackingId,
          },
          screenTrackingId,
          userInfo.id,
        );
      }

      this.logger.log(
        'Response status 201',
        `${DashboardController.name}#submitPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#submitPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('dashboard/changePaymentAmount')
  @UsePipes(new ValidationPipe())
  async changePaymentAmount(
    @Body(new ValidationPipe()) changePaymentAmountDto: ChangePaymentAmountDto,
    @Req() request: Request,
  ) {
    const screenTrackingId = changePaymentAmountDto.screenTracking;

    try {
      await this.dashboardService.changeMonthlyPaymentAmount(
        changePaymentAmountDto,
        request.id,
      );
      const userInfo = request.user;
      await this.logActivityService.createLogActivityUpdateUser(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${userInfo.email} - ${userInfo.role} Changed current payment amount to ${changePaymentAmountDto.amount}`,
        {
          id: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
          userName: userInfo.firstName + userInfo.lastName,
          screenTrackingId,
        },
        screenTrackingId,
        userInfo.id,
      );

      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#changePaymentAmount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#changePaymentAmount`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('dashboard/enableAutopay')
  @UsePipes(new ValidationPipe())
  async enableAutopay(
    @Body(new ValidationPipe()) enableAutopayDto: EnableAutopayDto,
    @Req() request: Request,
  ) {
    const paymentManagementId = enableAutopayDto.paymentManagementId;
    try {
      await this.dashboardService.enableAutopay(paymentManagementId);
      const userInfo = request.user;
      await this.logActivityService.createLogActivityUpdateUser(
        request,
        logActivityModuleNames.ACCOUNTS,
        `${userInfo.email} - ${userInfo.role} enabled Auto Payment`,
        {
          id: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
          userName: userInfo.firstName + userInfo.lastName,
          screenTrackingId: userInfo.screenTracking,
        },
        userInfo.screenTracking,
        userInfo.id,
      );

      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#enableAutopay`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#enableAutopay`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
