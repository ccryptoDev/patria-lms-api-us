import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserActivity, UserActivityDocument } from './activity.schema';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(UserActivity.name)
    private readonly userActivityModel: Model<UserActivityDocument>,

    private readonly logger: LoggerService,
  ) {}

  async createUserActivity(
    requestData: { userId: string; logData: string },
    subject: string,
    description: string,
    requestId: string,
  ) {
    this.logger.log(
      'Saving user log activity with params:',
      `${ActivityService.name}#createUserActivity`,
      requestId,
      { ...requestData, subject, description },
    );
    try {
      const { userId, logData } = requestData;
      const logInfoData = {
        user: userId,
        subject,
        description,
        logData,
      };
      const logDetails = await this.userActivityModel.create(
        logInfoData as any,
      );
      this.logger.log(
        'Saved user log activity successfully',
        `${ActivityService.name}#createUserActivity`,
        requestId,
        logDetails,
      );

      return logDetails;
    } catch (error) {
      this.logger.error(
        'Error',
        `${ActivityService.name}#createUserActivity`,
        requestId,
        error,
      );
    }
  }
}
