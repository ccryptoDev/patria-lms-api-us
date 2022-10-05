import { FlexPayService } from './flex-pay.service';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

@Controller('flexpay')
export class FlexPayController {
  constructor(private readonly flexpayService: FlexPayService) { }

  @Post('createToken')
  async initGwAccessToken() {
    // test create token
    // const data = await this.flexpayService.getGWAccessToken();

    // test card transaction
    const achData = {
      user: '62c9416f5282dbee40fcfa06',
      screenTracking: '62c9416f5282dbee40fcfa08',
      cardData: {
        expYear: '24',
        expMonth: '12',
        cvc: '123',
        cardCode: '4242424242424242',
      },
      amount: 25,
    };
    const data = await this.flexpayService.createGWCardTransaction(achData, '');
    return data;
  }
}
