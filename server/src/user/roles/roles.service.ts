import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppService } from '../../app.service';
import { LoggerService } from '../../logger/logger.service';
import { Roles, RolesDocument } from './roles.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Roles.name)
    private readonly rolesModel: Model<RolesDocument>,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async getAdminRoles(requestId: string) {
    const response: RolesDocument[] | null = await this.rolesModel
      .find(
        {
          roleName: { $ne: 'User' },
        },
        { roleName: 1 },
      )
      .sort({ roleName: 1 });
    if (!response || response.length <= 0) {
      const errorMessage = 'No roles found';
      this.logger.error(
        errorMessage,
        `${RolesService.name}#getAdminRoles`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    return response;
  }
}
