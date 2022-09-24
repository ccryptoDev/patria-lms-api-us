import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';

import {
  PracticeManagement,
  PracticeManagementDocument,
} from './practice-management.schema';
import { LoggerService } from '../../logger/logger.service';
import GetAllPracticeManagementsDto from './validation/getAllPracticeManagements.dto';
import AddPracticeManagementDto from './validation/addPracticeManagement.dto';
import { AppService } from '../../app.service';
import { State, StateDocument } from '../../user/state/state.schema';
import UpdatePracticeManagementDto from './validation/updatePracticeManagement.dto';
import { DatabaseSearchService } from '../../database-search/database-search.service';

@Injectable()
export class PracticeManagementService {
  constructor(
    @InjectModel(PracticeManagement.name)
    private readonly practiceManagementModel: Model<PracticeManagementDocument>,
    @InjectModel(State.name)
    private readonly stateModel: Model<StateDocument>,
    private readonly databaseSearchService: DatabaseSearchService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) { }

  async getAllLocations(requestId: string) {
    this.logger.log(
      'Getting all practice management locations',
      `${PracticeManagementService.name}#getAllLocations`,
      requestId,
    );
    const locations: PracticeManagementDocument[] =
      await this.practiceManagementModel
        .find({}, { location: 1 })
        .sort({ location: 1 });
    // if (!locations || locations.length <= 0) {
    //   throw new NotFoundException(
    //     undefined,
    //     'Practice management collection is empty',
    //   );
    // }
    // this.logger.log(
    //   'Got practice management locations:',
    //   `${PracticeManagementService.name}#getAllLocations`,
    //   requestId,
    //   locations,
    // );

    return locations;
  }

  async getAllPracticeManagements(
    getAllPracticeManagementsDto: GetAllPracticeManagementsDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all practice managements with params:',
      `${PracticeManagementService.name}#getAllPracticeManagements`,
      requestId,
      { getAllPracticeManagementsDto },
    );
    const { page, perPage } = getAllPracticeManagementsDto;
    let matchCriteria: any = {
      isDeleted: false,
    };

    if (getAllPracticeManagementsDto.search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string';
      }[] = this.processAllPracticeManagementsDataFields();
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        getAllPracticeManagementsDto.search,
        mappedDataFields,
      );
    }

    const response = (
      await this.practiceManagementModel.aggregate([
        {
          $match: matchCriteria,
        },
        ...this.getPaginationAggregation(page, perPage),
      ])
    )[0] ?? { rows: [], totalRows: 0 };

    this.logger.log(
      'Got practice managements:',
      `${PracticeManagementService.name}#getAllPracticeManagements`,
      requestId,
      response,
    );

    return response;
  }

  async addPracticeManagement(
    addPracticeManagementDto: AddPracticeManagementDto,
    requestId: string,
  ) {
    this.logger.log(
      'Adding practice management with params: ',
      `${PracticeManagement.name}#addPracticeManagement`,
      requestId,
      addPracticeManagementDto,
    );

    const { address, zip, phone, stateCode, openDate } =
      addPracticeManagementDto;
    const isValidState = await this.stateModel.findOne({
      stateCode: stateCode,
    });
    if (!isValidState) {
      const errorMessage = 'Invalid state code';
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#addPracticeManagement`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }

    const existingPracticeManagement =
      await this.practiceManagementModel.findOne({
        $or: [{ address }, { zip }, { phone }],
      });
    if (existingPracticeManagement) {
      const errorMessage = 'Practice management already exists';
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#addPracticeManagement`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }

    const newPracticeManagement = new this.practiceManagementModel({
      ...addPracticeManagementDto,
      openDate: moment(openDate).toISOString(),
    });
    await newPracticeManagement.save();

    const response = {
      practiceManagementId: newPracticeManagement._id,
    };
    this.logger.log(
      'Added practice management: ',
      `${PracticeManagement.name}#addPracticeManagement`,
      requestId,
      newPracticeManagement,
    );

    return response;
  }

  async getPracticeManagementById(id: string, requestId: string) {
    this.logger.log(
      'Getting practice management with params:',
      `${PracticeManagement.name}#getPracticeManagementById`,
      requestId,
      { id },
    );
    const practiceManagementDocument: PracticeManagementDocument | null =
      await this.practiceManagementModel.findById(id);
    if (!practiceManagementDocument) {
      const errorMessage = `Could not find practice management for id ${id}`;
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#getPracticeManagementById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    this.logger.log(
      'Got practice management:',
      `${PracticeManagement.name}#getPracticeManagementById`,
      requestId,
      practiceManagementDocument,
    );

    return practiceManagementDocument;
  }

  async updatePracticeManagementById(
    id: string,
    updatePracticeManagementDto: UpdatePracticeManagementDto,
    requestId: string,
  ) {
    this.logger.log(
      'Updating practice management with params:',
      `${PracticeManagement.name}#updatePracticeManagementById`,
      requestId,
      { id, updatePracticeManagementDto },
    );

    if (updatePracticeManagementDto.openDate) {
      (updatePracticeManagementDto.openDate as any) = moment(
        updatePracticeManagementDto.openDate,
      ).toISOString();
    }
    const practiceManagement: PracticeManagementDocument | null =
      await this.practiceManagementModel
        .findOneAndUpdate({ _id: id }, updatePracticeManagementDto as any, {
          new: true,
        })
        .select({ password: 0 });
    if (!practiceManagement) {
      const errorMessage = `Could not find practice management id ${id}`;
      this.logger.error(
        errorMessage,
        `${PracticeManagement.name}#updatePracticeManagementById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Updated admin:',
      `${PracticeManagement.name}#updatePracticeManagementById`,
      requestId,
      practiceManagement,
    );

    return practiceManagement;
  }

  processAllPracticeManagementsDataFields(): {
    data: string;
    dataType: 'string';
  }[] {
    const dataFields: {
      data: string;
      dataType: 'string';
    }[] = [
        {
          data: 'region',
          dataType: 'string',
        },
        {
          data: 'managementRegion',
          dataType: 'string',
        },
        {
          data: 'location',
          dataType: 'string',
        },
        {
          data: 'address',
          dataType: 'string',
        },
        {
          data: 'city',
          dataType: 'string',
        },
        {
          data: 'zip',
          dataType: 'string',
        },
        {
          data: 'phone',
          dataType: 'string',
        },
        {
          data: 'regionalManager',
          dataType: 'string',
        },
      ];

    return dataFields;
  }

  getPaginationAggregation(page: number, perPage: number) {
    return [
      {
        $sort: { region: 1 },
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
