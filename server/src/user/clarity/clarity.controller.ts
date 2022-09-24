import { ClarityService } from './clarity.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/roles/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Request } from 'express';
import { LoggerService } from '../../logger/logger.service';

@Controller('/api/application')
export class ClarityController {
  constructor(
    private readonly clarityService: ClarityService,
    private readonly logger: LoggerService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get('clarity/:screenTrackingId')
  @UsePipes(new ValidationPipe())
  async getAllClarityReport(@Param() payload: any, @Req() request: Request) {
    try {
      const response = await this.clarityService.getClarityInquiry(
        request,
        payload,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ClarityController.name}#saveSignature`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
