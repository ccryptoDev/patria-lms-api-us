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
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '../../user/auth/roles/role.enum';
import { Roles } from '../../user/auth/roles/roles.decorator';
import { RolesGuard } from '../../user/auth/roles/roles.guard';
import { LoggerService } from '../../logger/logger.service';

import { JwtAuthGuard } from '../../user/auth/jwt-auth.guard';
import { PracticeManagementService } from './practice-management.service';
import GetAllPracticeManagementsDto from './validation/getAllPracticeManagements.dto';
import { GetAllPracticeManagementsPipe } from './validation/getAllPracticeManagements.pipe';
import AddPracticeManagementDto from './validation/addPracticeManagement.dto';
import { AddPracticeManagementPipe } from './validation/addPracticeManagement.pipe';
import UpdatePracticeManagementDto from './validation/updatePracticeManagement.dto';
import { UpdatePracticeManagementPipe } from './validation/updatePracticeManagement.pipe';
import { AdminJwtPayload } from 'src/user/auth/types/jwt-payload.types';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';

@UseGuards(JwtAuthGuard)
@Controller('/api/admin/dashboard/practiceManagements')
export class PracticeManagementController {
  constructor(
    private readonly practiceManagementService: PracticeManagementService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
  ) {}

  @Get('locations')
  async getLocations(@Req() request: Request) {
    try {
      const response = await this.practiceManagementService.getAllLocations(
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#getLocations`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#getLocations`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @Get()
  async getAllPracticeManagements(
    @Req() request: Request,
    @Query(new GetAllPracticeManagementsPipe())
    getAllPracticeManagementsDto: GetAllPracticeManagementsDto,
  ) {
    try {
      const response = await this.practiceManagementService.getAllPracticeManagements(
        getAllPracticeManagementsDto,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#getAllPracticeManagements`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#getAllPracticeManagements`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Post()
  async addPracticeManagement(
    @Body(new AddPracticeManagementPipe())
    addPracticeManagementDto: AddPracticeManagementDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.practiceManagementService.addPracticeManagement(
        addPracticeManagementDto,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.MANAGE_PRACTICES,
        `${request.user.email} - ${role} Added new practice id ${response.practiceManagementId}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          newPracticeId: response.practiceManagementId,
          newPracticeAddress: addPracticeManagementDto.address,
          newPracticeRegion: addPracticeManagementDto.region,
          newPracticeCity: addPracticeManagementDto.city,
          newPracticeLocation: addPracticeManagementDto.location,
          newPracticeRegionalManager: addPracticeManagementDto.regionalManager,
          newPracticeManagementRegion:
            addPracticeManagementDto.managementRegion,
          newPracticeState: addPracticeManagementDto.stateCode,
          newPracticeZipCode: addPracticeManagementDto.zip,
          newPracticePhoneNumber: addPracticeManagementDto.phone,
        },
      );

      this.logger.log(
        'Response status 201',
        `${PracticeManagementController.name}#addPracticeManagement`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#addPracticeManagement`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @Get(':id')
  async getPracticeManagement(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    try {
      const response = await this.practiceManagementService.getPracticeManagementById(
        id,
        request.id,
      );
      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#getPracticeManagement`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#getPracticeManagement`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  @Patch(':id')
  @UsePipes(new UpdatePracticeManagementPipe())
  async updatePracticeManagement(
    @Param('id') id: string,
    @Body() updatePracticeManagementDto: UpdatePracticeManagementDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.practiceManagementService.updatePracticeManagementById(
        id,
        updatePracticeManagementDto,
        request.id,
      );
      const {
        id: AdminId,
        userName,
        email,
        role,
        practiceManagement,
      } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.MANAGE_PRACTICES,
        `${request.user.email} - ${role} Edited practice id ${id}`,
        {
          id: AdminId,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          newPracticeAddress: updatePracticeManagementDto.address,
          newPracticeRegion: updatePracticeManagementDto.region,
          newPracticeCity: updatePracticeManagementDto.city,
          newPracticeLocation: updatePracticeManagementDto.location,
          newPracticeRegionalManager:
            updatePracticeManagementDto.regionalManager,
          newPracticeManagementRegion:
            updatePracticeManagementDto.managementRegion,
          newPracticeState: updatePracticeManagementDto.stateCode,
          newPracticeZipCode: updatePracticeManagementDto.zip,
          newPracticePhoneNumber: updatePracticeManagementDto.phone,
        },
      );

      this.logger.log(
        'Response status 200',
        `${PracticeManagementController.name}#updatePracticeManagement`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PracticeManagementController.name}#updatePracticeManagement`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
