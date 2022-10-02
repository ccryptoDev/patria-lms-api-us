import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../user/auth/jwt-auth.guard';
import { LoggerService } from '../../logger/logger.service';
import { OffersService } from './offers.service';
import { OffersDto } from './validation/offers.dto';
import { SelectOfferDto } from './validation/selectOffer.dto';

// @UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly logger: LoggerService,
  ) {}

  @Post('offers')
  @UsePipes(new ValidationPipe())
  async offer(@Body() offersDto: OffersDto, @Req() request: Request) {
    offersDto.screenTrackingId = request.user.screenTracking;
    try {
      const response = await this.offersService.approvedUpToOffers(
        offersDto,
        request.id,
      );

      this.logger.log(
        'Response status 201',
        `${OffersController.name}#offer`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${OffersController.name}#offer`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('selectOffer')
  @HttpCode(204)
  @UsePipes(new ValidationPipe())
  async selectOffer(
    @Body() selectOfferDto: SelectOfferDto,
    @Req() request: Request,
  ) {
    selectOfferDto.screenTrackingId = request.user.screenTracking;
    this.logger.log(
      'Selecting offer with params:',
      `${OffersController.name}#selectOffer`,
      request.id,
      selectOfferDto,
    );

    try {
      await this.offersService.selectOffer(selectOfferDto, request.id);
      this.logger.log(
        'Response status 204',
        `${OffersController.name}#selectOffer`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${OffersController.name}#selectOffer`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('offer')
  @UsePipes(new ValidationPipe())
  async getOffer(@Req() request: Request) {
    const screenTrackingId = request.user.screenTracking;
    this.logger.log(
      'Getting offer with params:',
      `${OffersController.name}#getOffer`,
      request.id,
      { screenTrackingId },
    );

    try {
      const response = this.offersService.getOffer(
        screenTrackingId,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${OffersService.name}#selectOffer`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${OffersController.name}#getOffer`,
        request.id,
        error,
      );
      throw error;
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Post('calPayment')
  async initPaymentSchedule(
    @Body()
    payload: {
      apr: number;
      term: number;
      financedAmount: number;
    },
  ) {
    try {
      const { apr, term, financedAmount } = payload;
      return await this.offersService.calcMonthlyPayment(
        apr,
        financedAmount,
        0,
        term,
        '',
      );
    } catch (error) {
      this.logger.error(
        'Error',
        `${OffersController.name}#initPaymentSchedule`,
        ' request.id',
        error,
      );
      throw error;
    }
  }
}
