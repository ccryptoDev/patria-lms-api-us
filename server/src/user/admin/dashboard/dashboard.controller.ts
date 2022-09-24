import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../../../logger/logger.service';

import { JwtAuthGuard } from '../../../user/auth/jwt-auth.guard';
import { Role } from '../../../user/auth/roles/role.enum';
import { Roles } from '../../../user/auth/roles/roles.decorator';
import { RolesGuard } from '../../../user/auth/roles/roles.guard';
import { AdminJwtPayload } from '../../auth/types/jwt-payload.types';
import { DashboardService } from './dashboard.service';
import GetAllUsersDto from './validation/GetAllUsers.dto';
import { GetAllUsersPipe } from './validation/GetAllUsers.pipe';

@Controller('/api/admin/dashboard/users')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllUsers(
    @Req() request: Request & { user: AdminJwtPayload },
    @Query(new GetAllUsersPipe()) getAllUsersDto: GetAllUsersDto,
  ) {
    try {
      const response = await this.dashboardService.getAllUsers(
        request.user,
        getAllUsersDto,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${DashboardController.name}#getAllUsers`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${DashboardController.name}#getAllUsers`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
