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
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import { AdminJwtPayload } from '../auth/types/jwt-payload.types';

@Controller('/api/application')
export class ClarityController {
  constructor(
    private readonly clarityService: ClarityService,
    private readonly logger: LoggerService,
    private readonly logActivityService: LogActivityService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get('clarity/:screenTrackingId')
  @UsePipes(new ValidationPipe())
  async getAllClarityReport(
    @Param() payload: any,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.clarityService.getClarityInquiry(
        request,
        payload,
      );
      const { id, email, role } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.ACCOUNTS,
        `${request.user.email} - ${role} viewing the Credit Report`,
        {
          id,
          email,
          role,
          undefined,
          practiceManagementId: undefined,
          screenTrackingId: payload?.screenTrackingId,
        },
        undefined,
        undefined,
        payload.screenTrackingId,
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
