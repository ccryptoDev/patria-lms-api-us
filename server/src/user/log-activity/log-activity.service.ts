import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LogActivity,
  LogActivityDocument,
  LOG_TYPE,
  MODULE_NAME,
} from './log-activity.schema';
import { Model } from 'mongoose';
import { CountersService } from '../../counters/counters.service';
import { AdminJwtPayload } from '../auth/types/jwt-payload.types';
import { Request } from 'express';
import { LoggerService } from '../../logger/logger.service';
import GetPaginatedLogActivitiesDto from './validation/get-paginated-log-activities.dto';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import mongoose from 'mongoose';
import { ICommunicationHistoryItems } from './communication-history.interface';

export enum logActivityModuleNames {
  ACCOUNTS = 'Accounts',
  APPLICATION_LINK = 'Application Link',
  DOCUMENT_UPLOAD = 'Document Upload',
  LENDING_CENTER = 'Lending Center',
  LOAN_DETAILS = 'Loan Details',
  LOAN_SETTINGS = 'Loan Settings',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
  MANAGE_PATIENTS = 'Manage Borrowers',
  MANAGE_PRACTICES = 'Manage Practices',
  MANAGE_USERS = 'Manage Admin Users',
  OPPORTUNITIES = 'Application status',
  PAYMENT_SCHEDULE = 'Payment Schedule',
}

@Injectable()
export class LogActivityService {
  appService: any;
  constructor(
    @InjectModel(LogActivity.name)
    private readonly LogActivityModel: Model<LogActivityDocument>,
    private readonly CounterService: CountersService,
    private readonly databaseSearchService: DatabaseSearchService,
    private readonly logger: LoggerService, // @InjectModel(ScreenTracking.name) // private readonly ScreenTrackingModel: Model<ScreenTrackingDocument>,
  ) { }

  async createLogActivity(
    request: Request & { user: AdminJwtPayload },
    moduleName: string,
    message: string,
    data?: any,
    loanReference?: string,
    paymentManagementId?: string,
    screenTrackingId?: string,
    communicationHistory?: ICommunicationHistoryItems[],
  ) {
    const reference = await this.CounterService.getNextSequenceValue(
      'logs',
      request.id,
    );
    // let response: LogActivityDocument | null = null;
    // response = await this.LogActivityModel.findOne({
    //   screenTrackingId,
    //   moduleName: MODULE_NAME.COMMUNICATION,
    // });
    // if (response) {
    //   const newHistory = [
    //     ...response.communicationHistory,
    //     ...communicationHistory,
    //   ];
    //   await Object.assign(response, {
    //     communicationHistory: newHistory,
    //   }).save();
    // } else {
    const logInfo = {
      userId: request.user.id,
      jsonData: data ? JSON.stringify(data, null, '  ') : undefined,
      email: request.user?.email,
      ip: request.connection.remoteAddress,
      message,
      loanReference,
      logReference: `LOG_${reference.sequenceValue}`,
      moduleName,
      name: request.user.userName,
      paymentManagementId,
      practiceManagementId: request.user.practiceManagement,
      requestUri: request.url,
      screenTrackingId: screenTrackingId,
      communicationHistory: communicationHistory,
    };

    const response = await this.LogActivityModel.create(logInfo);
    // const newLogs = await this.LogActivityModel.findOne({
    //   screenTrackingId,
    //   moduleName: MODULE_NAME.COMMUNICATION,
    // });

    this.logger.log(
      'Log activity created:',
      `${LogActivityService.name}#createLogActivity`,
      request.id,
      response,
    );

    return { logActivityId: response._id };
  }

  async createLogActivityUpdateUser(
    request: any,
    moduleName: string,
    message: string,
    data?: any,
    screenTrackingId?: string,
    user?: any,
  ) {
    this.logger.log(
      'Creating log activity with params:',
      `${LogActivityService.name}#`,
      request.id,
      {
        user: user,
        moduleName,
        message,
        data,
        screenTrackingId,
      },
    );
    const reference = await this.CounterService.getNextSequenceValue(
      'logs',
      request.id,
    );

    const logInfo = {
      userId: user._id,
      jsonData: data ? JSON.stringify(data, null, '  ') : undefined,
      email: user.email,
      ip: request.connection.remoteAddress,
      message,
      logReference: `LOG_${reference.sequenceValue}`,
      moduleName,
      name: user.userName,
      requestUri: request.url,
      practiceManagementId: user.practiceManagement,
      screenTrackingId: screenTrackingId,
    };

    const response: LogActivityDocument = await this.LogActivityModel.create(
      logInfo,
    );
    this.logger.log(
      'Log activity created:',
      `${LogActivityService.name}#createLogActivity`,
      request.id,
      response,
    );

    return { logActivityId: response._id };
  }

  async getAllLogActivities(
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all log activities with params:',
      `${LogActivityService.name}#getAllLogActivities`,
      requestId,
      { getPaginatedLogActivitiesDto },
    );
    const { page, perPage } = getPaginatedLogActivitiesDto;

    let matchCriteria = {};
    if (getPaginatedLogActivitiesDto.search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string' | 'currency';
      }[] = this.processAllLogActivitiesDataFields();
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        getPaginatedLogActivitiesDto.search,
        mappedDataFields,
      );
    }

    const response = (
      await this.LogActivityModel.aggregate([
        { $match: matchCriteria },
        ...this.getPaginationAggregation(page, perPage),
      ])
    )[0] ?? { rows: [], totalRows: 0 };

    response.rows = response.rows.map(
      ({
        _id,
        createdAt,
        email,
        ip,
        loanReference,
        logReference,
        message,
        moduleName,
        screenTrackingId,
      }: any) => {
        return {
          id: _id,
          dateCreated: createdAt,
          email,
          ip,
          loanReference: loanReference ? loanReference : '--',
          logReference,
          message,
          moduleName,
          screenTrackingId,
        };
      },
    );
    this.logger.log(
      'Got log activities:',
      `${LogActivityService.name}#getAllLogActivities`,
      requestId,
      response,
    );

    return response;
  }

  async getLogActivityById(id: string, requestId: string) {
    this.logger.log(
      'Getting log activity with params:',
      `${LogActivityService.name}#getAdminById`,
      requestId,
      { id },
    );
    const logActivity: LogActivityDocument | null =
      await this.LogActivityModel.findById(id);

    if (!logActivity) {
      const errorMessage = `Could not find log id ${id}`;
      this.logger.error(
        errorMessage,
        `${LogActivityService.name}#getLogActivityById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Got log activity:',
      `${LogActivityService.name}#getLogActivityById`,
      requestId,
      logActivity,
    );

    return logActivity;
  }

  async getLogActivitiesByScreenTrackingId(
    screenTrackingId: any,
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all log activities by screen tracking id with params:',
      `${LogActivityService.name}#getLogActivitiesByScreenTrackingId`,
      requestId,
      { screenTrackingId, getPaginatedLogActivitiesDto },
    );
    const { page, perPage } = getPaginatedLogActivitiesDto;

    let matchCriteria = {};
    if (getPaginatedLogActivitiesDto.search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string' | 'currency';
      }[] = this.processAllLogActivitiesByScreenTrackingIdDataFields();
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        getPaginatedLogActivitiesDto.search,
        mappedDataFields,
      );
    }

    const response = (
      await this.LogActivityModel.aggregate([
        {
          $match: {
            type: { $ne: LOG_TYPE.USER_LOG },
            $or: [
              {
                screenTrackingId: {
                  $eq: mongoose.Types.ObjectId(screenTrackingId),
                },
              },
              {
                screenTrackingId: {
                  $eq: screenTrackingId,
                },
              },
            ],
          },
        },
        { $match: matchCriteria },
        ...this.getPaginationAggregation(page, perPage),
      ])
    )[0] ?? { rows: [], totalRows: 0 };

    response.rows = response.rows.map(
      ({ createdAt, logReference, message, moduleName }: any) => {
        return {
          dateCreated: createdAt,
          logReference,
          message,
          moduleName,
        };
      },
    );

    this.logger.log(
      'Got log activities by screen tracking id :',
      `${LogActivityService.name}#getLogActivitiesByScreenTrackingId`,
      requestId,
      response,
    );

    return response;
  }

  async communicationHistoryLogActivity(
    screenTrackingId: string,
    getPaginatedLogActivitiesDto: GetPaginatedLogActivitiesDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all log activities by screen tracking id with params:',
      `${LogActivityService.name}#getLogActivitiesByScreenTrackingId`,
      requestId,
      { screenTrackingId, getPaginatedLogActivitiesDto },
    );
    const { page, perPage } = getPaginatedLogActivitiesDto;

    let matchCriteria = {};
    if (getPaginatedLogActivitiesDto.search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string' | 'currency';
      }[] = this.processAllLogActivitiesByScreenTrackingIdDataFields();
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        getPaginatedLogActivitiesDto.search,
        mappedDataFields,
      );
    }

    // const response = (
    //   await this.LogActivityModel.aggregate([
    //     { $match: { screenTrackingId: { $eq: screenTrackingId } } },
    //     { $match: matchCriteria },
    //     { $match: { moduleName: { $eq: MODULE_NAME.COMMUNICATION } } },
    //     ...this.getPaginationAggregation(page, perPage),
    //   ])
    // )[0] ?? { rows: [], totalRows: 0 };
    const response = { rows: [], totalRows: 0 };
    response.rows = await this.LogActivityModel.find({
      screenTrackingId,
      moduleName: MODULE_NAME.COMMUNICATION,
    });

    response.rows = response.rows.map(
      ({ createdAt, communicationHistory }: any) => {
        return {
          dateCreated: createdAt,
          communicationHistory,
        };
      },
    );

    this.logger.log(
      'Got log activities by screen tracking id :',
      `${LogActivityService.name}#getLogActivitiesByScreenTrackingId`,
      requestId,
      response,
    );

    return response;
  }

  processAllLogActivitiesDataFields(): {
    data: string;
    dataType: 'string';
  }[] {
    const dataFields: {
      data: string;
      dataType: 'string';
    }[] = [
        {
          data: 'loanReference',
          dataType: 'string',
        },
        {
          data: 'logReference',
          dataType: 'string',
        },
        {
          data: 'moduleName',
          dataType: 'string',
        },
        {
          data: 'message',
          dataType: 'string',
        },
        {
          data: 'ip',
          dataType: 'string',
        },
      ];

    return dataFields;
  }

  processAllLogActivitiesByScreenTrackingIdDataFields(): {
    data: string;
    dataType: 'string';
  }[] {
    const dataFields: {
      data: string;
      dataType: 'string';
    }[] = [
        {
          data: 'logReference',
          dataType: 'string',
        },
        {
          data: 'moduleName',
          dataType: 'string',
        },
        {
          data: 'message',
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

  async createMailLogActivity(
    moduleName: string,
    message: string,
    data?: any,
    loanReference?: string,
    paymentManagementId?: string,
    screenTrackingId?: string,
  ) {
    this.logger.log(
      'Creating log activity with params:',
      `${LogActivityService.name}#`,
      '',
      {
        user: '',
        moduleName,
        message,
        data,
        loanReference,
        paymentManagementId,
        screenTrackingId,
      },
    );
    const reference = await this.CounterService.getNextSequenceValue(
      'logs',
      '',
    );

    const logInfo = {
      userId: '',
      jsonData: data ? JSON.stringify(data, null, '  ') : undefined,
      email: '',
      ip: '',
      message,
      loanReference,
      logReference: `LOG_${reference.sequenceValue}`,
      moduleName,
      name: '',
      paymentManagementId,
      practiceManagementId: '',
      requestUri: '',
      screenTrackingId: screenTrackingId,
    };

    const response: LogActivityDocument = await this.LogActivityModel.create(
      logInfo,
    );
    this.logger.log(
      'Log activity created:',
      `${LogActivityService.name}#createLogActivity`,
      '',
      response,
    );

    return { logActivityId: response._id };
  }
}
