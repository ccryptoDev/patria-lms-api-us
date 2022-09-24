import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../user/auth/jwt-auth.guard';
import { FlexPayService } from '../flex-pay/flex-pay.service';
import {
  DisburseAmountDto,
  MakePaymentFlexDto,
  PaymentType,
} from '../validation/makePayment.dto';
import { PaymentManagementCronService } from './payment-management-cron.service';
import { PaymentManagementService } from './payment-management.service';

@UseGuards(JwtAuthGuard)
@Controller('/api')
export class PaymentManagementController {
  constructor(
    private readonly paymentManagementCron: PaymentManagementCronService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly flexPayService: FlexPayService,
  ) {}

  @Post('test/checkExpiredApplications')
  async runAutomaticPayments() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException();
    }

    try {
      await this.paymentManagementCron.checkExpiredApplications();
    } catch (error) {
      throw error;
    }
  }

  @Post('test/runDelinquencyCron')
  async runDelinquencyCron() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException();
    }

    try {
      await this.paymentManagementCron.delinquencyCron();
    } catch (error) {
      throw error;
    }
  }

  @Post('makePayment')
  async makePaymentFlexPayCard(
    @Body() payload: MakePaymentFlexDto,
    @Req() request: Request,
  ) {
    let response = null;
    // response = await this.flexPayService.getAchTransactionStatus();
    if (payload.type === PaymentType.ACH) {
      response = await this.paymentManagementService.makePaymentFlexPayACH(
        payload,
        request.id,
      );
    } else if (payload.type === PaymentType.CARD) {
      // response = await this.paymentManagementService.makePaymentFlexCard(
      //   payload,
      //   request.id,
      // );

      response = 'To be implemented';
    } else {
      response = 'Not a appropiate payment method';
    }

    return response;
  }

  @Post(':screenTrackingId/disburseAmount')
  async disbursePaymentViaAch(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request,
  ) {
    const response = await this.paymentManagementService.disbursePaymentToUser(
      {
        screenTrackingId,
      },
      request.id,
    );
    return response;
  }

  // @Post('makePayment')
  // async makePaymentFlexPayACH(@Body() payload: any) {
  //   const response = await this.paymentManagementService.makePaymentFlexPayACH(
  //     payload,
  //   );
  //   return response;
  // }
}
