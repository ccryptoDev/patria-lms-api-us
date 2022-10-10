import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import moment from 'moment';

import { LoggerService } from '../logger/logger.service';
import { ApplyDto } from './application/validation/apply.dto';
import { User, UserDocument } from './user.schema';
import { Roles, RolesDocument } from './roles/roles.schema';
import { State, StateDocument } from './state/state.schema';
import { ActivityService } from './activity/activity.service';
import { CountersService } from '../counters/counters.service';
import { CountersDocument } from '../counters/counters.schema';
import { AppService } from '../app.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from './screen-tracking/screen-tracking.schema';
import {
  PaymentManagement,
  PaymentManagementDocument,
} from '../loans/payments/payment-management/payment-management.schema';
import {
  PracticeManagement,
  PracticeManagementDocument,
} from '../loans/practice-management/practice-management.schema';
import crypto from 'crypto';
import { Esignature, EsignatureDocument } from './esignature/esignature.schema';
import { S3Service } from '../s3/s3.service';
import { bool } from 'aws-sdk/clients/signer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Roles.name) private readonly rolesModel: Model<RolesDocument>,
    @InjectModel(State.name) private readonly stateModel: Model<StateDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(PracticeManagement.name)
    private readonly practiceManagementModel: Model<PracticeManagementDocument>,
    @InjectModel(Esignature.name)
    private readonly esignatureModel: Model<EsignatureDocument>,
    private readonly s3Service: S3Service,
    private readonly countersService: CountersService,
    private readonly userActivityService: ActivityService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  waitFor = (ms) => new Promise((r) => setTimeout(r, ms));

  async stateFetch(
    userSSN: UserDocument[],
    statNumber: number,
    requestFrom: string,
  ) {
    const sFetch = await userSSN.forEach(async (userV) => {
      const screenSSN: ScreenTrackingDocument =
        await this.screenTrackingModel.findOne({
          user: userV._id,
          isCompleted: true,
        });

      if (screenSSN && requestFrom != 'Login') {
        const paidStatus: PaymentManagement =
          await this.paymentManagementModel.findOne({
            user: userV._id,
          });

        if (paidStatus.status == 'paid' || paidStatus.status == 'expired') {
          // console.log('paidStatus' + paidStatus.status);
        } else if (
          paidStatus.status == 'in-repayment non-prime' ||
          paidStatus.status == 'in-repayment prime' ||
          paidStatus.status == 'approved'
        ) {
          statNumber = statNumber + 1;
        } else {
          statNumber = statNumber + 1;
        }
      } else {
      }
    });
    await this.waitFor(1000);

    return statNumber;
  }

  async ssnValidatenext(
    applyDto: string,
    requestId: string,
    requestFrom: string,
  ) {
    let statNumber: number;
    statNumber = 0;
    try {
      // const userSSN: UserDocument = await this.userModel.findOne({
      //   ssnNumber: applyDto,
      //   isExistingLoan: true,
      // });

      const userSSN: UserDocument[] = await this.userModel.find({
        ssnNumber: applyDto,
        isExistingLoan: true,
      });

      const sFetch = await this.stateFetch(userSSN, statNumber, requestFrom);
      statNumber = sFetch;
      if (statNumber > 0) {
        const errorCode = 400;
        let errorMessage =
          'There is already an existing loan with Patria Lending, please see your Patient Care Coordinator to see if you have any availability with your existing loan offer. ';
        if (requestFrom == 'Login') {
          errorMessage =
            'There is already an existing loan with Patria Lending, please see your Patient Care Coordinator to see if you have any availability with your existing loan offer. ';
        }
        throw new BadRequestException(
          this.appService.errorHandler(errorCode, errorMessage, requestId),
        );
      }

      //return statNumber;
    } catch (error) {
      this.logger.log(
        'Error:SSNValidation PSK',
        `${applyDto}.SSNValidation`,
        requestId,
        error,
      );
      throw error;
    }
  }

  async createNewUser(
    user: ApplyDto,
    requestId: string,
    saveUserFunc: (user: UserDocument) => Promise<UserDocument>,
    findOneUserFunc: (query: Record<string, unknown>) => Promise<UserDocument>,
  ) {
    this.logger.log(
      'Creating new user with params:',
      `${UserService.name}.createNewUser`,
      requestId,
      user,
    );
    try {
      const existingUser: UserDocument = await findOneUserFunc({
        email: {
          $regex: new RegExp(
            '^' + user.email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$',
            'i',
          ),
        },
      });

      if (existingUser) {
        const screenTracking: ScreenTrackingDocument | null =
          await this.screenTrackingModel.findOne({
            user: existingUser._id,
          });
        if (
          (screenTracking && screenTracking.creditScore) ||
          (screenTracking &&
            screenTracking.declineReasons &&
            screenTracking.declineReasons.length >= 1)
        ) {
          throw new BadRequestException(
            this.appService.errorHandler(
              400,
              `You already have an account with Patria Lending, please sign in with your existing account.`,
              requestId,
            ),
          );
        }

        return existingUser;
      }

      if (!user.practiceManagement) {
        const practiceManagement = await this.practiceManagementModel.findOne({
          location: 'Santa Monica',
          isDeleted: false,
        });
        if (!practiceManagement) {
          this.logger.error(
            'Practice management not found',
            `${UserService.name}#createNewUser`,
            requestId,
          );
          throw new NotFoundException(
            this.appService.errorHandler(
              404,
              `PracticeManagement not found for practiceId: ${user.practiceManagement}`,
              requestId,
            ),
          );
        }

        user.practiceManagement = practiceManagement._id;
      } else {
        const practiceManagement = await this.practiceManagementModel.findOne({
          _id: user.practiceManagement,
          isDeleted: false,
        });
        if (!practiceManagement) {
          this.logger.error(
            'Practice management not found',
            `${UserService.name}#createNewUser`,
            requestId,
          );
          throw new NotFoundException(
            this.appService.errorHandler(
              404,
              `PracticeManagement not found for practiceId: ${user.practiceManagement}`,
              requestId,
            ),
          );
        }
      }

      return this.setupUser(user, saveUserFunc, requestId);
    } catch (error) {
      this.logger.log(
        'Error:',
        `${UserService.name}.createNewUser`,
        requestId,
        error,
      );
      throw error;
    }
  }

  async setupUser(
    userData: ApplyDto,
    saveUserFunc: (user: UserDocument) => Promise<UserDocument>,
    requestId: string,
  ): Promise<UserDocument> {
    const userReferenceData: CountersDocument =
      await this.countersService.getNextSequenceValue('user', requestId);
    const userReference = `USR_${userReferenceData.sequenceValue}`;
    const newUser: UserDocument = new this.userModel(userData);
    newUser.userReference = userReference;
    newUser.dateOfBirth = moment(userData.dateOfBirth).format('YYYY-MM-DD');

    const roleData = await this.rolesModel.findOne({ roleName: 'User' });
    if (roleData) {
      newUser.role = roleData._id;
    }
    newUser.password = await this.encryptPassword(newUser.password);
    const state = await this.stateModel.findOne({
      stateCode: newUser.state,
    });
    if (state) {
      newUser._state = state._id;
    }
    const savedUser = await saveUserFunc(newUser);

    const userRequest = {
      userId: savedUser._id,
      logData: `User registration successful - ${savedUser.email}`,
    };
    const userSubject = 'Registration Success';
    const userDescription = 'User registration.';

    this.userActivityService.createUserActivity(
      userRequest,
      userSubject,
      userDescription,
      requestId,
    );

    return savedUser;
  }

  /**
   * Hash the user's password
   * @param user UserDocument
   */
  async encryptPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  generateRandomPassword(length = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Direct call to database to save a user
   * @param user UserDocument
   */
  async save(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  /**
   * Direct call to database to find one user
   * @param query key:value pair
   */
  async findOne(query: Record<string, unknown>): Promise<UserDocument> {
    return this.userModel.findOne(query);
  }

  async getInfo(userId: string, requestId: string) {
    this.logger.log(
      'Get user info:PSK',
      `${UserService.name}#getInfo\n\n\n\n${userId}`,
      requestId,
      userId,
    );
    const user = await this.userModel
      .findById(userId)
      .populate('screenTracking');
    const st = user.screenTracking as ScreenTrackingDocument;
    const userInfo = {
      userReference: user.userReference,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user?.[0]?.[0]?.phone,
      dateOfBirth: user.dateOfBirth,
      street: user.street,
      zipCode: user.zipCode,
      state: user.state,
      ssnNumber: user.ssnNumber,
      registeredDate: (user as any).createdAt,
      lastProfileUpdateTime: (user as any).updatedAt,
      annualIncome: (st?.incomeAmount ?? 0) * 12,
      monthlyIncome: st?.incomeAmount ?? 0,
      anticipatedFinancedAmount: st?.offerData?.financedAmount ?? 0,
      preDTIdebt: st?.preDTIMonthlyAmount ?? 0,
      preDTIdebtPercent: st?.preDTIPercentValue ?? 0,
    };

    return userInfo;
  }

  async getApplicationInformation(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting application information with params:',
      `${UserService.name}#getApplicationInformation`,
      requestId,
      { screenTrackingId },
    );
    const screenTrackingDocument: ScreenTrackingDocument | null =
      await this.screenTrackingModel
        .findById(screenTrackingId)
        .populate('user');

    if (!screenTrackingDocument) {
      this.logger.error(
        'ScreenTracking not found',
        `${UserService.name}#getApplicationInformation`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `ScreenTracking id ${screenTrackingId} not found.`,
          requestId,
        ),
      );
    }

    const user = screenTrackingDocument.user as UserDocument;

    let ricSignature: string | undefined;
    const esignature: EsignatureDocument | null =
      await this.esignatureModel.findOne({ user });
    if (esignature) {
      const signature = await this.s3Service.downloadFile(
        esignature.signaturePath,
        requestId,
      );
      ricSignature = `data:${
        signature.ContentType
      };base64,${signature.Body.toString('base64')}`;
    }

    screenTrackingDocument.selectedOffer.interestRate = parseFloat(
      screenTrackingDocument.selectedOffer.interestRate,
    ).toFixed(2);
    const response = {
      userId: user.id,
      address: user.street,
      street: user.street,
      annualIncome: screenTrackingDocument.incomeAmount,
      approvedUpTo: screenTrackingDocument?.selectedOffer?.financedAmount,
      applicationReference: screenTrackingDocument.applicationReference,
      city: user.city,
      email: user.email,
      firstName: user.firstName,
      isCompleted: screenTrackingDocument.isCompleted,
      lastName: user.lastName,
      lastStep: screenTrackingDocument.lastLevel,
      phones: user.phones,
      referenceNumber: user.userReference,
      requestedAmount: screenTrackingDocument.requestedLoanAmount,
      ricSignature,
      screenTrackingId: screenTrackingDocument._id,
      selectedOffer: screenTrackingDocument.selectedOffer,
      ssn: user.ssnNumber,
      state: user.state,
      zip: user.zipCode,
    };
    this.logger.log(
      'Got application information:',
      `${UserService.name}#getApplicationInformation`,
      requestId,
      response,
    );

    return response;
  }

  async getUserByPMId(pmId: string): Promise<UserDocument> {
    const paymentManagementDocument: PaymentManagementDocument | null =
      await this.paymentManagementModel.findById(pmId);
    const user = await this.userModel.findById(paymentManagementDocument.user);
    return user;
  }
}
