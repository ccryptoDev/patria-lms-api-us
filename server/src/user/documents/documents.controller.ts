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
import { Request } from 'express';
import { LoggerService } from '../../logger/logger.service';

import { ApplicationController } from '../application/application.controller';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserDocumentsService } from './documents.service';
import UploadDocDto from './validation/uploadDoc.dto';
import { ScreenTrackingService } from '../screen-tracking/screen-tracking.service';
import {
  AdminJwtPayload,
  UserJwtPayload,
} from '../auth/types/jwt-payload.types';
import { Role } from '../auth/roles/role.enum';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../log-activity/log-activity.service';

@UseGuards(JwtAuthGuard)
@Controller('/api')
export class DocumentsController {
  constructor(
    private readonly userDocumentsService: UserDocumentsService,
    private readonly logger: LoggerService,
    private readonly screenTrackingService: ScreenTrackingService,
    private readonly logActivityService: LogActivityService,
  ) { }

  @Post('application/uploadDocument')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async uploadDocument(
    @Body() uploadDocDto: UploadDocDto,
    @Req() request: Request & { user: UserJwtPayload & AdminJwtPayload },
  ) {
    uploadDocDto.userId = request.user.id;
    try {
      const response = await this.userDocumentsService.uploadDocument(
        uploadDocDto,
        request.id,
        request.user,
      );

      // await this.screenTrackingService.setCompleted(uploadDocDto.userId);

      this.logger.log(
        'Response status 201',
        `${DocumentsController.name}#uploadDocument`,
        request.id,
        response,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#uploadDocument`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('admin/dashboard/users/documents/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserDocuments(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request,
  ) {
    try {
      const response = await this.userDocumentsService.getUserDocuments(
        screenTrackingId,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${DocumentsController.name}#getUserDocuments`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#getUserDocuments`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('admin/dashboard/users/documents/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  async uploadDocumentByAdmin(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body() uploadDocDto: UploadDocDto,
    @Req() request: Request & { user: UserJwtPayload & AdminJwtPayload },
  ) {
    try {
      const response = await this.userDocumentsService.uploadDocument(
        uploadDocDto,
        request.id,
        request.user,
        screenTrackingId,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.DOCUMENT_UPLOAD,
        `${request.user.email} - ${role} Uploaded document id ${response.documentId}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
          documentId: response.documentId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 201',
        `${DocumentsController.name}#uploadDocument`,
        request.id,
        response,
      );
      return response;
    } catch (error) {
      console.log('ERROR', error);
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#uploadDocument`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
