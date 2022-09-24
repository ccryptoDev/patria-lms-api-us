import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { LoggerService } from '../../logger/logger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/roles/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { RolesService } from './roles.service';

@Controller('/api/admin/roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAdminRoles(@Req() request: Request) {
    try {
      const response = await this.rolesService.getAdminRoles(request.id);

      this.logger.log(
        'Response status 200',
        `${RolesController.name}#getAdminRoles`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${RolesController.name}#getApplicationInformation`,
        request.id,
        error,
      );
    }
  }
}
