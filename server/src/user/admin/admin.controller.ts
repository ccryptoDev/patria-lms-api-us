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
} from '@nestjs/common';
import { Request } from 'express';

import { LoggerService } from '../../logger/logger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/roles/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { AdminJwtPayload } from '../auth/types/jwt-payload.types';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../log-activity/log-activity.service';
import { AdminService } from './admin.service';
import GetAllUsersDto from './dashboard/validation/GetAllUsers.dto';
import { GetAllUsersPipe } from './dashboard/validation/GetAllUsers.pipe';
import { CreateAdminDto } from './validation/createAdmin.dto';
import { UpdateAdminDto } from './validation/updateAdminDto';

@Controller('/api/admin/dashboard/')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Post('admins')
  @UsePipes(new ValidationPipe())
  async createAdmin(
    @Body() createUserDto: CreateAdminDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    
    try {
      const response = await this.adminService.createAdmin(
        createUserDto,
        request?.id,
      );
      // const { id, userName, email, role, practiceManagement } = request.user;
      // await this.logActivityService.createLogActivity(
      //   request,
      //   logActivityModuleNames.MANAGE_USERS,
      //   `${request.user.email} - ${role} Added new user with username ${createUserDto.userName} and email ${createUserDto.email}`,
      //   {
      //     id,
      //     email,
      //     role,
      //     userName,
      //     practiceManagementId: practiceManagement,
      //     newAdminId: response.adminId,
      //     newAdminUserName: createUserDto.userName,
      //     newAdminEmail: createUserDto.email,
      //     newAdminPhoneNumber: createUserDto.phoneNumber,
      //     newAdminRole: createUserDto.role,
      //     newAdminPracticeManagement: createUserDto.practiceManagement,
      //   },
      // );
      this.logger.log(
        'Response status 201',
        `${AdminController.name}#createAdmin`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#createAdmin`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get('admins')
  async getAllAdmins(
    @Req() request: Request & { user: AdminJwtPayload },
    @Query(new GetAllUsersPipe()) getAllAdminsDto: GetAllUsersDto,
  ) {
    try {
      const response = await this.adminService.getAllAdmins(
        request.user,
        getAllAdminsDto,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${AdminController.name}#getAllAdmins`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#getAllAdmins`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get('admins/:id')
  async getAdmin(
    @Param('id') id: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminService.getAdminById(id, request.id);
      this.logger.log(
        'Response status 200',
        `${AdminController.name}#getAdmin`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#getAdmin`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Patch('admins/:id')
  @UsePipes(new ValidationPipe())
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminService.updateAdminById(
        id,
        updateAdminDto,
        request.id,
      );
      const {
        id: adminId,
        userName,
        email,
        role,
        practiceManagement,
      } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.MANAGE_USERS,
        `${request.user.email} - ${role} Edited admin id ${id}`,
        {
          id: adminId,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          newAdminUserName: updateAdminDto.userName,
          newAdminEmail: updateAdminDto.email,
          newAdminPhoneNumber: updateAdminDto.phoneNumber,
          newAdminRole: updateAdminDto.role,
          newAdminPracticeManagement: updateAdminDto.practiceManagement,
        },
      );

      this.logger.log(
        'Response status 200',
        `${AdminController.name}#updateAdmin`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminController.name}#updateAdmin`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
