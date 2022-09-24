import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';

import { LoggerService } from '../../../logger/logger.service';
import { AdminJwtPayload } from '../../auth/types/jwt-payload.types';
import { User, UserDocument } from '../../../user/user.schema';
import GetAllUsersDto from './validation/GetAllUsers.dto';
import { DatabaseSearchService } from '../../../database-search/database-search.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly databaseSearchService: DatabaseSearchService,
    private readonly logger: LoggerService,
  ) {}

  async getAllUsers(
    admin: AdminJwtPayload,
    getAllUsersDto: GetAllUsersDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all users with params:',
      `${DashboardService.name}#getAllUsers`,
      requestId,
      { admin, getAllUsersDto },
    );
    const { page, perPage } = getAllUsersDto;
    let matchCriteria = {
      screenTracking: { $exists: true },
    };

    if (getAllUsersDto.search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string' | 'boolean';
      }[] = this.processAllUsersDataFields();
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        getAllUsersDto.search,
        mappedDataFields,
      );
    }

    const response = (
      await this.userModel.aggregate([
        {
          $lookup: {
            from: 'screentracking',
            localField: 'screenTracking',
            foreignField: '_id',
            as: 'screenTracking',
          },
        },
        {
          $unwind: '$screenTracking',
        },
        // {
        //   $lookup: {
        //     from: 'practicemanagement',
        //     localField: 'practiceManagement',
        //     foreignField: '_id',
        //     as: 'practiceManagement',
        //   },
        // },
        // {
        //   $unwind: '$practiceManagement',
        // },
        {
          $match: matchCriteria,
        },
        ...this.getPaginationAggregation(page, perPage),
      ])
    )[0] ?? { rows: [], totalRows: 0 };

    response.rows = response.rows.map((user) => {
      return {
        screenTrackingId: user?.screenTracking._id,
        userReference: user?.userReference,
        name: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        phone: user?.phones[0]?.phone,
        registerStatus: user?.screenTracking?.isCompleted
          ? 'Completed'
          : 'Incomplete',
        practiceName: user?.practiceManagement?.location,
        createdDate: moment(user.createdAt).format('MM/DD/YYYY hh:mm a'),
      };
    });
    this.logger.log(
      'All users response:',
      `${DashboardService.name}#getAllUsers`,
      requestId,
      response,
    );

    return response;
  }

  processAllUsersDataFields(): {
    data: string;
    dataType: 'string' | 'boolean';
  }[] {
    const dataFields: {
      data: string;
      dataType: 'string' | 'boolean';
    }[] = [
      {
        data: 'userReference',
        dataType: 'string',
      },
      {
        data: 'firstName',
        dataType: 'string',
      },
      {
        data: 'lastName',
        dataType: 'string',
      },
      {
        data: 'email',
        dataType: 'string',
      },
      {
        data: 'phones.0.phone',
        dataType: 'string',
      },
      {
        data: 'screenTracking.isCompleted',
        dataType: 'boolean',
      },
      {
        data: 'practiceManagement.location',
        dataType: 'string',
      },
    ];

    return dataFields;
  }

  getPaginationAggregation(page: number, perPage: number) {
    return [
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: null,
          totalRows: {
            $sum: 1,
          },
          rows: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $unwind: '$rows',
      },
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      {
        $group: {
          _id: null,
          totalRows: { $first: '$totalRows' },
          rows: {
            $push: '$rows',
          },
        },
      },
      {
        $project: { _id: 0 },
      },
    ];
  }
}
