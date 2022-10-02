import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { LoggerService } from '../../logger/logger.service';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/roles/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { AdminJwtPayload } from '../auth/types/jwt-payload.types';
import { ConsentService } from './consent.service';

@Controller('/api')
export class ConsentController {
  constructor(
    private readonly userConsentService: ConsentService,
    private readonly logger: LoggerService,
    private readonly logActivityService: LogActivityService,
  ) { }

  @Get('admin/dashboard/users/consents/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserConsents(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.userConsentService.getUserConsents(
        screenTrackingId,
        request.user,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.ACCOUNTS,
        `${request.user.email} - ${role} viewing the Document Center`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 200',
        `${ConsentController.name}#getUserDocuments`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ConsentController.name}#getUserDocuments`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
