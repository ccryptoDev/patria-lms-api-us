import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from '../../logger/logger.service';

import { JwtAuthGuard } from '../../user/auth/jwt-auth.guard';
import { Role } from '../../user/auth/roles/role.enum';
import { Roles } from '../../user/auth/roles/roles.decorator';
import { RolesGuard } from '../../user/auth/roles/roles.guard';
import { AdminJwtPayload } from '../../user/auth/types/jwt-payload.types';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import { CommentsService } from './comments.service';
import { AddCommentDto } from './validation/add-comment.dto';
import GetAllCommentsByScreenTrackingDto from './validation/get-all-comments-by-screen-tracking.dto';
import { GetAllCommentsByScreenTrackingPipe } from './validation/get-all-comments-by-screen-tracking.pipe';

@Controller('/api/admin/dashboard/comments')
export class CommentsController {
  constructor(
    private readonly logActivityService: LogActivityService,
    private readonly commentsService: CommentsService,
    private readonly logger: LoggerService,
  ) {}

  @Post(':screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addComment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new ValidationPipe()) addCommentDto: AddCommentDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    addCommentDto.screenTrackingId = screenTrackingId;
    addCommentDto.createdBy = request.user.email;

    try {
      const response: {
        commentId: string;
      } = await this.commentsService.addComment(addCommentDto, request.id);
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.ACCOUNTS,
        `${request.user.email} - ${role} Added comment id ${response.commentId}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
          subject: addCommentDto.subject,
          comment: addCommentDto.comment,
          createdBy: addCommentDto.createdBy,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 201:',
        `${CommentsController.name}#addComment`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${CommentsController.name}#addComment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get(':screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllCommentsByScreenTrackingId(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
    @Query(new GetAllCommentsByScreenTrackingPipe())
    getAllCommentsByScreenTrackingDto: GetAllCommentsByScreenTrackingDto,
  ) {
    try {
      const response: {
        commentId: string;
      } = await this.commentsService.getAllCommentsByScreenTrackingId(
        screenTrackingId,
        getAllCommentsByScreenTrackingDto,
        request.id,
      );

      this.logger.log(
        'Response status 200:',
        `${CommentsController.name}#getAllCommentsByScreenTrackingId`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${CommentsController.name}#getAllCommentsByScreenTrackingId`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
