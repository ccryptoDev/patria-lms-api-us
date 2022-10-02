import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  DefaultValuePipe,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { AppService } from '../../../app.service';
import { LoggerService } from '../../../logger/logger.service';
import { RolesDocument } from '../../roles/roles.schema';
import { Admin, AdminDocument } from '../admin.schema';
import { CreateAdminDto } from '../validation/createAdmin.dto';
import { NunjucksCompilerService } from '../../../nunjucks-compiler/nunjucks-compiler.service';
import { AdminJwtPayload } from '../../auth/types/jwt-payload.types';
import { UpdateAdminDto } from '../validation/updateAdminDto';
import GetAllUsersDto from '../dashboard/validation/GetAllUsers.dto';
import { AdminApproval, AdminApprovalDocument } from './approval.schema';
import { Roles } from '../../../user/auth/roles/roles.decorator';
import { Role } from '../../../user/auth/roles/role.enum';
import { JwtAuthGuard } from '../../../user/auth/jwt-auth.guard';
import { RolesGuard } from '../../../user/auth/roles/roles.guard';
import { AdminApprovalService } from './approval.service';
import { ACTION_PAYLOAD } from './approval.dto';

@Controller('/api/admin/dashboard/approvals')
export class AdminApprovalController {
  constructor(
    // private readonly adminService: AdminService,
    // private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
    private readonly adminApprovalService: AdminApprovalService,
  ) { }

  @Get('/')
  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getApplications(
    @Query('status')
    status: AdminApproval['status'],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(50), ParseIntPipe) perPage: number,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Query('type', new DefaultValuePipe('')) type: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const applications = await this.adminApprovalService.getAllRequest(
        status,
        page,
        perPage,
        search,
        request.user.id,
        type,
      );

      return applications;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminApprovalController.name}#getApplications`,
        request.user.id,
        error,
      );
      throw error;
    }
  }

  @Put('action')
  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async onApprovalAction(
    @Body() payload: ACTION_PAYLOAD,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    const result = await this.adminApprovalService.actionOnRequest(
      payload,
      request.user,
    );
    return result;
  }
}
