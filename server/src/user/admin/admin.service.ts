import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import mongoose, { Model } from 'mongoose';
import moment from 'moment';
import passwordGenerator from 'generate-password';

import { AppService } from '../../app.service';
import { LoggerService } from '../../logger/logger.service';
import { Roles, RolesDocument } from '../roles/roles.schema';
import { Admin, AdminDocument } from './admin.schema';
import { CreateAdminDto } from './validation/createAdmin.dto';
import {
  PracticeManagement,
  PracticeManagementDocument,
} from '../../loans/practice-management/practice-management.schema';
import { MandrillService } from '../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { AdminJwtPayload } from '../auth/types/jwt-payload.types';
import GetAllUsersDto from './dashboard/validation/GetAllUsers.dto';
import { UpdateAdminDto } from './validation/updateAdminDto';
import { DatabaseSearchService } from '../../database-search/database-search.service';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    @InjectModel(Roles.name) private readonly rolesModel: Model<RolesDocument>,
    @InjectModel(PracticeManagement.name)
    private readonly practiceManagementModel: Model<PracticeManagementDocument>,
    private readonly nunjucksService: NunjucksCompilerService,
    private readonly mandrillService: MandrillService,
    private readonly databaseSearchService: DatabaseSearchService,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) { }

  async createAdmin(createAdminDto: CreateAdminDto, requestId: string) {
    const { userName, email, phoneNumber, role, password } =
      createAdminDto;
    this.logger.log(
      'Creating admin user with params:',
      `${AdminService.name}#createNewUser`,
      requestId,
      createAdminDto,
    );
    // const user: AdminDocument | null = await this.adminModel.findOne({
    //   email: {
    //     $regex: new RegExp(
    //       '^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$',
    //       'i',
    //     ),
    //   },
    // });
    // if (user) {
    //   const errorMessage = 'User already exists';
    //   this.logger.error(
    //     errorMessage,
    //     `${AdminService.name}#createNewUser`,
    //     requestId,
    //   );
    //   throw new BadRequestException(
    //     this.appService.errorHandler(400, errorMessage, requestId),
    //   );
    // }

    const adminData: any = {};
    adminData.userName = userName;
    adminData.email = email;
    adminData.isDeleted = false;
    adminData.phoneNumber = phoneNumber;
    const initialPassword: string = await this.generateInitialPassword(
      password,
    );

    adminData.password = await this.generateEncryptedPassword(initialPassword);
    const roleDocument: RolesDocument | null = await this.rolesModel.findOne({
      roleName: role,
    });

    if (!roleDocument) {
      const errorMessage = `Role ${role} not found`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#createNewUser`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    adminData.role = roleDocument._id;
    // if (roleDocument.roleName !== 'Super Admin' && practiceManagement) {
    //   const practiceManagementDocument: PracticeManagementDocument | null =
    //     await this.practiceManagementModel.findById(practiceManagement);

    //   console.log("practice Management document: ", practiceManagementDocument);

    //   if (!practiceManagementDocument) {
    //     this.logger.error(
    //       'Practice management not found',
    //       `${AdminService.name}#createNewUser`,
    //       requestId,
    //     );
    //     throw new NotFoundException(
    //       this.appService.errorHandler(
    //         404,
    //         `Practice id ${PracticeManagement} not found`,
    //         requestId,
    //       ),
    //     );
    //   }
    //   adminData.practiceManagement = practiceManagement;
    // }

    const newAdmin: AdminDocument = new this.adminModel(adminData);
    await newAdmin.save();

    const context = {
      userName: adminData.userName,
      email: adminData.email,
      password: initialPassword,
      roleName: roleDocument.roleName,
      link: `${this.configService.get<string>('baseUrl')}/admin/login`,
    };
    const html: string = await this.nunjucksService.htmlToString(
      'emails/admin-register.html',
      context,
    );
    await this.mandrillService.sendEmail(
      'no-reply@patrialending.com',
      adminData.email,
      'Admin registration',
      html,
      requestId,
    );

    const response = {
      adminId: newAdmin._id,
    };

    return response;
  }

  async getAllAdmins(
    admin: AdminJwtPayload,
    getAllAdminsDto: GetAllUsersDto,
    requestId: string,
  ) {
    // this.logger.log(
    //   'Getting all admins with params:',
    //   `${AdminService.name}#getAllAdmins`,
    //   requestId,
    //   { admin, getAllAdminsDto },
    // );
    const { page, perPage } = getAllAdminsDto;
    let matchCriteria: any = {
      isDeleted: false,
    };

    if (getAllAdminsDto.search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string';
      }[] = this.processAllAdminsDataFields();
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        getAllAdminsDto.search,
        mappedDataFields,
      );
    }

    const response = (
      await this.adminModel.aggregate([
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'role',
          },
        },
        {
          $unwind: '$role',
        },
        {
          $lookup: {
            from: 'practice_management',
            localField: 'practiceManagement',
            foreignField: '_id',
            as: 'practiceManagementName',
          },
        },
        {
          $unwind: {
            path: '$practiceManagementName',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: matchCriteria,
        },
        ...this.getPaginationAggregation(page, perPage),
      ])
    )[0] ?? { rows: [], totalRows: 0 };

    response.rows = response.rows.map((admin: any) => {
      return {
        id: admin?._id,
        userName: admin?.userName,
        email: admin?.email,
        phone: admin?.phoneNumber,
        role: admin?.role.roleName,
        location: admin?.practiceManagementName?.location || 'Patria',
        createdDate: moment(admin.createdAt).format('MM/DD/YYYY hh:mm a'),
      };
    });
    // this.logger.log(
    //   'Got admins:',
    //   `${AdminService.name}#getAllAdmins`,
    //   requestId,
    //   response,
    // );

    return response;
  }

  async getAdminById(id: string, requestId: string) {
    this.logger.log(
      'Getting admin with params:',
      `${AdminService.name}#getAdminById`,
      requestId,
      { id },
    );
    const admin: AdminDocument | null = await this.adminModel
      .findById(id)
      .populate('role')
      .select({ password: 0 });
    if (!admin) {
      const errorMessage = `Could not find user id ${id}`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#getAdminById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    // this.logger.log(
    //   'Got admin:',
    //   `${AdminService.name}#getAdminById`,
    //   requestId,
    //   admin,
    // );

    return admin;
  }

  async updateAdminById(
    id: string,
    updateAdminDto: UpdateAdminDto,
    requestId: string,
  ) {
    this.logger.log(
      'Updating admin with params:',
      `${AdminService.name}#getAdminById`,
      requestId,
      { id, ...updateAdminDto },
    );
    const role: RolesDocument | null = await this.rolesModel.findOne({
      roleName: updateAdminDto.role,
    });
    if (!role) {
      const errorMessage = `Could not find role ${updateAdminDto.role}`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#getAdminById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    updateAdminDto.role = role._id;
    const admin: AdminDocument | null = await this.adminModel
      .findOneAndUpdate({ _id: id }, updateAdminDto, { new: true })
      .select({ password: 0 });
    if (!admin) {
      const errorMessage = `Could not find user id ${id}`;
      this.logger.error(
        errorMessage,
        `${AdminService.name}#getAdminById`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Updated admin:',
      `${AdminService.name}#getAdminById`,
      requestId,
      admin,
    );

    return admin;
  }

  async generateEncryptedPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async generateInitialPassword(password?): Promise<string> {
    return password
      ? password
      : passwordGenerator.generate({
        length: 10,
        numbers: true,
        uppercase: true,
        strict: true,
      });
  }

  processAllAdminsDataFields(): {
    data: string;
    dataType: 'string';
  }[] {
    const dataFields: {
      data: string;
      dataType: 'string';
    }[] = [
        {
          data: 'userName',
          dataType: 'string',
        },
        {
          data: 'email',
          dataType: 'string',
        },
        {
          data: 'phoneNumber',
          dataType: 'string',
        },
        {
          data: 'roleName',
          dataType: 'string',
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
