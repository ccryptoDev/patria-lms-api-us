import {
  Body,
  Controller,
  HttpException,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../../../user/auth/jwt-auth.guard';
import { LoggerService } from '../../../logger/logger.service';
import { LoanpaymentproService } from './loanpaymentpro.service';
import { LoanPaymentProCardTokenDocument } from './schemas/loanpaymentpro-card-token.schema';
import { AddCardDto } from './validation/addCard.dto';
import { Model } from 'mongoose';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../../user/screen-tracking/screen-tracking.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ValidateCardDto } from './validation/validateCard.dto';
import { ScreenTrackingService } from '../../../user/screen-tracking/screen-tracking.service';

// @UseGuards(JwtAuthGuard)
@Controller('/api')
export class LoanpaymentproController {
  constructor(
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    private readonly screenTrackingService: ScreenTrackingService,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly logger: LoggerService,
  ) {}

  @Post('application/addCard')
  @UsePipes(new ValidationPipe())
  async addCard(@Body() addCardDto: AddCardDto, @Req() request: Request) {
    const sc = request?.body?.screenTrackingId;
    try {
      addCardDto.billingZip = addCardDto.billingZip.slice(0, 5);
      // eslint-disable-next-line prefer-const
      let response: any = null;
      if (addCardDto.paymentType === 'CARD') {
        // const cardValidation = await this.loanPaymentProService.validateCard(
        //   addCardDto,
        //   user,
        // );
        // if (!cardValidation?.CardValid) {
        //   throw new HttpException('Card is not Valid', 400);
        // }
        response = await this.loanPaymentProService.addCardViaFlexPay(
          addCardDto,
          request?.id,
        );
      } else if (addCardDto.paymentType === 'ACH') {
        response = await this.loanPaymentProService.addAchViaFlexPay(
          addCardDto,
          'LOS request ID',
        );
      } else {
        throw new HttpException('Not a Valid Payment Method', 400);
      }
      this.logger.log(
        'Response status 201:',
        `${LoanpaymentproController.name}#addCard`,
        request?.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LoanpaymentproController.name}#addCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('validateCard')
  @UsePipes(new ValidationPipe())
  async validateCard(
    @Body() validateCardDto: ValidateCardDto,
    @Req() request: Request,
  ) {
    try {
      const response = await this.loanPaymentProService.validateCard(
        validateCardDto,
        request.id,
      );

      this.logger.log(
        'Response status 201:',
        `${LoanpaymentproController.name}#addCard`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LoanpaymentproController.name}#addCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('application/testing')
  @UsePipes(new ValidationPipe())
  async testingCard(@Body() payload: any, @Req() request: Request) {
    const { screenTrackingId } = payload;
    try {
      const response: LoanPaymentProCardTokenDocument = await this.loanPaymentProService.testingPaymentService(
        screenTrackingId,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LoanpaymentproController.name}#addCard`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
