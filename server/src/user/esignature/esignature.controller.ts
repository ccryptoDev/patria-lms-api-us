import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EsignatureService } from './esignature.service';
import { SaveSignatureDto } from './validation/saveSignature.dto';
import { Request } from 'express';

import { LoggerService } from '../../logger/logger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class EsignatureController {
  constructor(
    private readonly esignatureService: EsignatureService,
    private readonly logger: LoggerService,
  ) {}

  @Post('esignature')
  @UsePipes(new ValidationPipe())
  async saveSignature(
    @Body() saveSignatureDto: SaveSignatureDto,
    @Req() request: Request,
  ) {
    saveSignatureDto.screenTrackingId = request.user.screenTracking;
    try {
      const response = await this.esignatureService.saveSignature(
        saveSignatureDto,
        request,
      );

      this.logger.log(
        'Response status 201',
        `${EsignatureController.name}#saveSignature`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${EsignatureController.name}#saveSignature`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
