import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import mongoose, { Model } from 'mongoose';
import moment from 'moment';
import passwordGenerator from 'generate-password';

import { AppService } from '../../../app.service';
import { LoggerService } from '../../../logger/logger.service';
import { Roles, RolesDocument } from '../../roles/roles.schema';
import { Admin, AdminDocument } from '../admin.schema';
import { CreateAdminDto } from '../validation/createAdmin.dto';
import { NunjucksCompilerService } from '../../../nunjucks-compiler/nunjucks-compiler.service';
import { AdminJwtPayload } from '../../auth/types/jwt-payload.types';
import { UpdateAdminDto } from '../validation/updateAdminDto';
import GetAllUsersDto from '../dashboard/validation/GetAllUsers.dto';
import {
  AdminApproval,
  AdminApprovalDocument,
  APPROVAL_STATUS,
} from './approval.schema';
import {
  ACTION_PAYLOAD,
  APPROVAL_CREATE_TYPE,
  CollectionName,
} from './approval.dto';
import { User, UserDocument } from '../../../../src/user/user.schema';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class AdminApprovalService {
  constructor(
    @InjectModel(AdminApproval.name)
    private readonly adminApprovalModel: Model<AdminApprovalDocument>,
    @InjectModel(Roles.name) private readonly rolesModel: Model<RolesDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async createApprovalRequest(payload: APPROVAL_CREATE_TYPE) {
    try {
      const response = await this.adminApprovalModel.create(
        payload as AdminApprovalDocument,
      );
      return { data: response, ok: true, error: null };
    } catch (error) {
      this.logger.error('ERROR::createApprovalRequest::', error);
      return { error: error, ok: false, data: null };
    }
  }

  async getAllRequest(
    status: AdminApproval['status'],
    page: number,
    perPage: number,
    search: string,
    requestId: string,
    type: string,
  ) {
    const limit = page * perPage || 10;
    const skip = (page - 1) * perPage || 0;
    console.log('first', status);
    const query = {};
    if (search) {
    }
    if (status) {
      query['status'] = status;
    }
    const total = await this.adminApprovalModel.countDocuments(query);
    const result = await this.adminApprovalModel
      .find(query)
      .populate('agent', { userName: 1 })
      .populate('user', { userReference: 1 })
      .limit(limit)
      .skip(skip);

    return {
      total: total,
      items: result,
    };
  }

  async actionOnRequest(payload: ACTION_PAYLOAD, request) {
    try {
      const { approvalId, status } = payload;
      const approvalData = await this.adminApprovalModel.findById({
        _id: approvalId,
      });
      if (!approvalData) {
        throw new HttpException('Approval Request not Exist', 404);
      }
      if (status === APPROVAL_STATUS.APPROVED) {
        const isUpdated = await this.parseAndUpdateData(approvalData);
        if (!isUpdated)
          throw new HttpException('Chnages Not Updated, Try Again!', 500);
      }
      await this.adminApprovalModel.updateOne(
        { _id: approvalId },
        { status: status, approvedBy: request.id },
      );
      return {
        message: `Request has been ${status}`,
      };
    } catch (error) {
      return new HttpException(error, 500);
    }
  }

  async parseAndUpdateData(approvalData: AdminApprovalDocument) {
    try {
      const {
        fieldToUpdate,
        collectionName,
        screenTracking,
        user,
      } = approvalData;

      const payload = {};
      let query = {};
      let Model = null;

      fieldToUpdate.map((item) => {
        const { key, value } = item;
        payload[key] = value;
      });

      if (collectionName === CollectionName.USER_COLLECTION) {
        query = { _id: user };
        Model = this.userModel;
      }
      if (Model) {
        await Model.updateOne(query, payload);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
