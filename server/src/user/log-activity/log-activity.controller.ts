import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { LoggerService } from '../../logger/logger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/roles/role.enum';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { LOG_TYPE } from './log-activity.schema';
import { LogActivityService } from './log-activity.service';
import GetPaginatedLogActivitiesDto from './validation/get-paginated-log-activities.dto';
import { GetAllLogActivitiesPipe } from './validation/get-paginated-log-activities.pipe';

import { AddCommunicationHistoryDto } from './validation/add-communication-history-dto';
import { AdminJwtPayload } from '../../user/auth/types/jwt-payload.types';

@Controller('/api/admin/dashboard/logActivities')
export class LogActivityController {
  constructor(
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get()
  async getAllLogActivities(
    @Req() request: Request,
    @Query(new GetAllLogActivitiesPipe())
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
  ) {
    try {
      const response = await this.logActivityService.getAllLogActivities(
        getPaginatedLogActivitiesDto,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${LogActivityController.name}#getAllLogActivities`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LogActivityController.name}#getAllLogActivities`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get(':id')
  async getLogActivityById(@Req() request: Request, @Param('id') id: string) {
    try {
      const response = await this.logActivityService.getLogActivityById(
        id,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${LogActivityController.name}#getLogActivityById`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LogActivityController.name}#getLogActivityById`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get('user/:screenTrackingId')
  async getLogActivityByScreenTrackingId(
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
    @Query(new GetAllLogActivitiesPipe())
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
  ) {
    try {
      let response = [];

      response =
        await this.logActivityService.getLogActivitiesByScreenTrackingId(
          screenTrackingId,
          getPaginatedLogActivitiesDto,
          request.id,
        );

      this.logger.log(
        'Response status 200',
        `${LogActivityController.name}#getLogActivityById`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LogActivityController.name}#getLogActivityById`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Get('user/communicationHistory/:screenTrackingId')
  async communicationHistoryLogActivity(
    @Req() request: Request,
    @Param('screenTrackingId') screenTrackingId: string,
    @Query(new GetAllLogActivitiesPipe())
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
  ) {
    try {
      const response =
        await this.logActivityService.communicationHistoryLogActivity(
          screenTrackingId,
          getPaginatedLogActivitiesDto,
          request.id,
        );
      this.logger.log(
        'Response status 200',
        `${LogActivityController.name}#getLogActivityById`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${LogActivityController.name}#getLogActivityById`,
        request.id,
        error,
      );

      throw error;
    }
  }

  @Post('user/communicationHistory/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addCommunicationHistory(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new ValidationPipe())
    addCommunicationHistoryDto: AddCommunicationHistoryDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const { id, userName, email, role, practiceManagement } = request.user;
      return await this.logActivityService.createLogActivity(
        request,
        'Communication',
        `${request.user.email} - ${role} Communication history created`,
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
        [addCommunicationHistoryDto],
      );
    } catch (err) {
      this.logger.error(
        'Error:',
        `${LogActivityController.name}#getLogActivityById`,
        request.id,
        err,
      );
      throw err;
    }
  }
}
