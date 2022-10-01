import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';

import { LoggerService } from '../../logger/logger.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../user/screen-tracking/screen-tracking.schema';
import {
  LOAN_STATUS,
  PaymentManagement,
  PaymentManagementDocument,
} from '../payments/payment-management/payment-management.schema';
import { CompleteApplicationDto } from './dtos/CompleteApplication.dto';
import { User, UserDocument } from '../../user/user.schema';
import { AppService } from '../../app.service';
import { LedgerService } from '../ledger/ledger.service';
import { PaymentService } from '../payments/payment.service';
import { ChangePaymentAmountDto } from './dtos/change-payment-amount.dto';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import { ConsentService } from '../../user/consent/consent.service';
import {
  Esignature,
  EsignatureDocument,
} from '../../user/esignature/esignature.schema';
import { S3Service } from '../../s3/s3.service';
import { IPaymentScheduleItem } from '../../loans/payments/payment-management/payment-schedule-item.interface';
import { LoanSettingsService } from '../loan-settings/loan-settings.service';
import { AdminService } from '../../user/admin/admin.service';
import {
  EmploymentHistory,
  EmploymentHistoryDocument,
} from '../../user/employment-history/employment-history.schema';
import { TransunionService } from '../underwriting/transunion/transunion.service';
import { StatusApproval } from './dtos/loan-settings.dto';
import axios from 'axios';
import config from '../../app.config';
import { SCREEN_LEVEL } from './types';
import { ConfigService } from '@nestjs/config';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { MandrillService } from '../../mandrill/mandrill.service';
import { AuthService } from '../../user/auth/auth.service';
import * as jwt from 'jsonwebtoken';
import { secret } from '../../user/auth/auth.config';
import { Role } from '../../../src/user/auth/roles/role.enum';
import { CollectionName } from '../../../src/user/admin/approvals/approval.dto';
import { AdminApprovalService } from '../../../src/user/admin/approvals/approval.service';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(PaymentManagement.name)
    private readonly PaymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly ScreenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(Esignature.name)
    private readonly esignatureModel: Model<EsignatureDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(EmploymentHistory.name)
    private readonly employmentHistoryModel: Model<EmploymentHistoryDocument>,
    private readonly s3Service: S3Service,
    private readonly ledgerService: LedgerService,
    private readonly paymentService: PaymentService,
    private readonly databaseSearchService: DatabaseSearchService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly consentService: ConsentService,
    private readonly loanSettingsService: LoanSettingsService,
    private readonly adminService: AdminService,
    private readonly transunionService: TransunionService,
    private readonly configService: ConfigService,
    private readonly nunjucksService: NunjucksCompilerService,
    private readonly mailService: MandrillService,
    private readonly authService: AuthService,
    private readonly adminApprovalService: AdminApprovalService,
  ) {}

  async getApplicationByStatus(
    status: PaymentManagement['status'],
    page: number,
    perPage: number,
    search: string,
    requestId: string,
    type: string,
  ) {
    this.logger.log(
      'Getting complete applications with params:',
      `${AdminDashboardService.name}#getApplicationByStatus\n\n\n\n${type}\n\n`,
      requestId,
      status,
    );

    let matchCriteria = {
      status: typeof status === 'string' ? status : { $in: status },
      user: { $exists: true },
      screenTracking: { $exists: true },
    };

    if (search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string' | 'currency';
      }[] = this.processApplicationByStatusDataFields(status);
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        search,
        mappedDataFields,
      );
    }
    // console.log('matchCriterai====>', matchCriteria['$and'][0]['$or']);
    const result = await this.queryApplicationsByStatus(
      matchCriteria,
      page,
      perPage,
    );
    const loanSettings = await this.loanSettingsService.getLoanSettings();
    const today: Date = moment().startOf('day').toDate();
    result.items = await Promise.all(
      result.items.map(async (paymentManagement) => {
        const screenTracking = paymentManagement.screenTracking;
        let paidTransaction = [];
        let currentBalance = 0;
        if (paymentManagement && paymentManagement.paymentSchedule) {
          paidTransaction = paymentManagement.paymentSchedule.filter(
            (payment: any) => payment.status === 'paid',
          );
          const paidPrincipal = paidTransaction.reduce(function (balance, pt) {
            return balance + pt.paidPrincipal;
          }, 0);
          currentBalance =
            screenTracking?.approvedUpTo -
            screenTracking?.offerData?.loanAmount +
            paidPrincipal;
        }
        const paymentManagementDoc: PaymentManagementDocument = await this.PaymentManagementModel.findOne(
          {
            _id: paymentManagement._id,
          },
        );
        const ledger = this.ledgerService.getPaymentLedger(
          paymentManagementDoc,
          moment().startOf('day').toDate(),
          requestId,
        );
        let collectionAdmin = 'Unassigned';
        let collectionEmail = '';
        // this.logger.log(
        //   `PSK\n\nCOLLECTIONUSER\n\n${collectionAdmin}`,
        //   `${paymentManagement?.collectionAssignedUser}#getApplicationByStatussssssssss\n\n\n${type}`,
        //   requestId,
        //   result,
        // );
        if (
          paymentManagement?.collectionAssignedUser &&
          paymentManagement?.collectionAssignedUser != ''
        ) {
          const response = await this.adminService.getAdminById(
            paymentManagement?.collectionAssignedUser,
            '',
          );
          collectionAdmin = `${response.userName}`;
          collectionEmail = `${response.email}`;
        }
        const paymentScheduleItems: IPaymentScheduleItem[] =
          paymentManagement.paymentSchedule?.length > 0 &&
          paymentManagement.paymentSchedule.filter(
            (scheduleItem) =>
              moment(scheduleItem.date).startOf('day').isBefore(today) &&
              scheduleItem.status === 'opened',
          );
        if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
        } else {
          // const furthestLatePayment = paymentScheduleItems[0];
          // const updateStatus: PaymentManagementDocument['status'] =
          //   await this.determineDelinquentTier(
          //     moment(today).diff(furthestLatePayment.date, 'day'),
          //   );
          // await this.PaymentManagementModel.updateOne(
          //   { _id: paymentManagement._id },
          //   {
          //     status: updateStatus,
          //     delinquentDays: moment(today).diff(
          //       furthestLatePayment.date,
          //       'day',
          //     ),
          //   },
          // );
        }
        return {
          userId: paymentManagement.user?._id,
          currentBalance: currentBalance,
          screenTrackingId: paymentManagement?.screenTracking?._id,
          pmId: paymentManagement._id,
          userReference: paymentManagement.user?.userReference,
          name:
            paymentManagement?.user?.firstName +
            ' ' +
            paymentManagement?.user?.lastName,
          phone: paymentManagement?.user?.phones?.[0]?.phone,
          email: paymentManagement?.user?.email,
          location: paymentManagement?.practiceManagement?.location,
          interestRate: paymentManagement?.interestApplied,
          dateCreated: paymentManagement?.createdAt,
          approvedUpTo: screenTracking?.approvedUpTo,
          selectedAmount: ledger.payoff,
          status: paymentManagement?.status,
          origin: screenTracking?.origin,
          loanAmount: screenTracking?.offerData?.loanAmount,
          term: screenTracking?.offerData?.term,
          progress: screenTracking.lastlevel,
          collectionAssignStatus: paymentManagement?.collectionAssignStatus,
          collectionsAccountStatus: paymentManagement?.collectionsAccountStatus,
          collectionAssignedUser: paymentManagement?.collectionAssignedUser,
          collectionAdmin: collectionAdmin,
          collectionEmail: collectionEmail,
          promiseToPay: paymentManagement?.promiseToPay,
          delinquencyDays: paymentManagement?.delinquentDays,
        } as CompleteApplicationDto;
      }),
    );

    // this.logger.log(
    //   'Complete applications:',
    //   `${AdminDashboardService.name}#getApplicationByStatussssssssss`,
    //   requestId,
    //   result,
    // );

    if (type.includes('collections')) {
      let resultValue: Record<string, any>[] = result.items;
      const numberValue: Array<number> = Array<number>();
      let numberV = 0;
      for (const paymentManagement in result.items) {
        const paymentManagement1 = await this.PaymentManagementModel.findOne({
          user: result.items[numberV]['userId'],
        });
        result.items[numberV];

        const paymentScheduleItems: IPaymentScheduleItem[] = paymentManagement1.paymentSchedule.filter(
          (scheduleItem) =>
            moment(scheduleItem.date).startOf('day').isBefore(today) &&
            scheduleItem.status === 'opened',
        );
        if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
        } else {
          const furthestLatePayment = paymentScheduleItems[0];
          if (
            moment(today).diff(furthestLatePayment.date, 'day') >=
            loanSettings.delinquencyPeriod
          ) {
          } else {
            numberValue.push(numberV);
            const newArray = resultValue.filter(
              (value) => value != result.items[numberV],
            );
            resultValue = newArray;
          }
        }

        numberV = numberV + 1;
      }

      result.items = resultValue;
      result.total = resultValue.length;
    }

    return result;
  }

  async updateUserData(
    payload: any,
    request: { id: string; userName: string; email: string; role: string },
  ) {
    const {
      screenTrackingId,
      secondaryEmail,
      phoneNumber,
      phoneNumberType,
      name,
      firstName,
      lastName,
    } = payload;

    const screenData = await this.ScreenTrackingModel.findById(screenTrackingId)
      .populate('user')
      .lean();
    if (!screenData) {
      throw new HttpException(
        this.appService.errorHandler(
          404,
          'Application Not Found',
          screenTrackingId,
        ),
        404,
      );
    }
    const userdata = screenData.user as UserDocument;

    if (secondaryEmail) {
      const isEmailExist = await this.userModel.exists({
        email: secondaryEmail,
      });
      if (isEmailExist) {
        throw new HttpException(
          this.appService.errorHandler(
            404,
            'Email Already Exist',
            screenTrackingId,
          ),
          404,
        );
      }
      payload.isEmailVerified = false;
      const response: {
        token: string;
        role: string;
      } = await this.authService.generateJwt(userdata, userdata._id);
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-email-verification.html',
        {
          userName: `${userdata.firstName} ${userdata.lastName}`,
          link: `${baseUrl}/api/admin/dashboard/verify-email/${response.token}`,
        },
      );
      const subject = 'Email Update Request Received!';
      const from = 'contact@patrialending.com';
      const to = secondaryEmail;
      await this.mailService.sendEmail(from, to, subject, html, '');
    }

    if (phoneNumber) {
      payload.phones = [...userdata.phones];
      payload.phones.push({ phone: phoneNumber, type: phoneNumberType });
    }
    let descriptionMessage = null;
    if (request.role === Role.UserServicing && name) {
      const approvalPayload = {
        email: request.email,
        agent: request.id,
        user: userdata._id,
        fieldToUpdate: [
          { key: 'firstName', value: firstName },
          { key: 'lastName', value: lastName },
        ],
        description: `${request.email} requested to change the name from ${userdata.firstName} ${userdata.lastName} to ${name}`,
        currentValue: [
          { key: 'firstName', value: userdata.firstName },
          { key: 'lastName', value: userdata.lastName },
        ],
        collectionName: CollectionName.USER_COLLECTION,
        screenTracking: screenTrackingId,
      };
      const response = await this.adminApprovalService.createApprovalRequest(
        approvalPayload,
      );
      descriptionMessage = approvalPayload.description;
      if (!response.ok) {
        return { message: 'Something Went Wrong' };
      }
      return {
        message: 'Request has been sent to update the Info',
        descriptionMessage,
      };
    } else {
      delete payload.screenTrackingId;
      await this.userModel.updateOne({ _id: userdata._id }, payload);
    }

    return {
      message: 'Info Updated Successfully',
      descriptionMessage: `changed the name from ${userdata.firstName} ${userdata.lastName} to ${name}`,
    };
  }

  async verifyEmailToken(token: string) {
    const decoded: any = jwt.verify(token, secret);
    if (!decoded || !decoded.id) {
      return 'Something Went Wrong';
    }
    const { id, screenTracking } = decoded;
    console.log('decoded', decoded);
    const userData: UserDocument = await this.userModel.findById(id);
    if (!userData.secondaryEmail) {
      return 'Email Change Request Not Found';
    }
    const isAlreadyExist = await this.userModel.find(
      { id: id },
      { email: userData.secondaryEmail },
    );
    if (isAlreadyExist) {
      return 'Email Already Exist';
    }
    const payload = {
      email: userData.secondaryEmail,
      isEmailVerified: true,
    };
    await this.userModel.updateOne({ _id: id }, payload);
    userData.email = userData.secondaryEmail;

    return 'Email verified';
  }

  async changeApplicationStatus(payload: StatusApproval) {
    try {
      const { screentrackingId, status } = payload;
      const screendata = await this.ScreenTrackingModel.findById(
        screentrackingId,
      ).lean();
      const lastLevel = Number(screendata.lastlevel);

      if (!screendata) {
        throw new HttpException('Application Not Found', 404);
      }
      if (status === 'approved') {
        const { LOS_URL } = config();
        const url = `${LOS_URL}/admin/proceed-rules`;
        const response = await axios.post(url, { screenId: screentrackingId });

        if (response.status !== 200) {
          throw new HttpException(response.statusText, response.status);
        }

        await this.ScreenTrackingModel.updateOne(
          { _id: screentrackingId },
          { lastlevel: lastLevel + 1 },
        );
      }

      const paymentData = await this.PaymentManagementModel.updateOne(
        { screenTracking: screentrackingId, status: LOAN_STATUS.MANUAL_REVIEW },
        { status: LOAN_STATUS.PENDING },
        { upsert: true },
      );

      if (paymentData?.nModified === 0) {
        throw new HttpException('Application not updated', 404);
      }

      return {
        error: false,
        data: screendata,
        message: `Application has been ${status}`,
      };
    } catch (error) {
      const errorData = error?.response?.data?.error || 'Internal Server Error';
      console.log('error =========', error);
      this.logger.error(
        'ERROR::changeApplicationStatus:',
        error?.response?.data,
      );
      throw new HttpException(
        this.appService.errorHandler(500, errorData, payload.screentrackingId),
        500,
      );
    }
  }

  async getLoanCounters(requestId: string) {
    this.logger.log(
      'Getting loan counters:',
      `${AdminDashboardService.name}#getLoanCounters`,
      requestId,
    );

    const result = await Promise.all([
      this.PaymentManagementModel.find({
        status: { $in: ['approved', 'pending'] },
      }).countDocuments(),
      this.PaymentManagementModel.find({
        status: { $in: ['denied'] },
      }).countDocuments(),
      this.PaymentManagementModel.find({
        status: { $in: ['expired'] },
      }).countDocuments(),
      this.PaymentManagementModel.find({
        status: {
          $in: [
            'in-repayment delinquent1',
            'in-repayment delinquent2',
            'in-repayment delinquent3',
            'in-repayment delinquent4',
          ],
        },
      }).countDocuments(),
      this.PaymentManagementModel.find({
        status: { $in: ['in-repayment prime', 'in-repayment non-prime'] },
      }).countDocuments(),
    ]);

    let expiredCount = 0;
    let delinquentCount = 0;
    // paymentmanagementData[0].expired == undefined
    //   ? 0
    //   : paymentmanagementData[0].expired.length;

    const paymentManagements: PaymentManagementDocument[] = await this.PaymentManagementModel.find(
      {},
    );
    for (const paymentManagement of paymentManagements) {
      if (
        paymentManagement.status == 'expired' ||
        paymentManagement.status == 'in-repayment delinquent1' ||
        paymentManagement.status == 'in-repayment delinquent2' ||
        paymentManagement.status == 'in-repayment delinquent3' ||
        paymentManagement.status == 'in-repayment delinquent4'
      ) {
        const findUser = await this.userModel.findOne({
          _id: paymentManagement.user,
        });

        if (!findUser) {
        } else {
          if (paymentManagement.status == 'expired') {
            expiredCount += 1;
          }
          if (
            paymentManagement.status == 'in-repayment delinquent1' ||
            paymentManagement.status == 'in-repayment delinquent2' ||
            paymentManagement.status == 'in-repayment delinquent3' ||
            paymentManagement.status == 'in-repayment delinquent4'
          ) {
            delinquentCount += 1;
          }
        }
      }
    }

    const response = {
      opportunities: result[0],
      denied: result[1],
      expired: expiredCount,
      delinquent: delinquentCount, //result[3],
      inRepayment: result[4],
    };

    return response;
  }

  async determineDelinquentTier(
    days: number,
  ): Promise<PaymentManagementDocument['status']> {
    if (days < 30) {
      return 'in-repayment delinquent1';
    } else if (days < 60) {
      return 'in-repayment delinquent2';
    } else if (days < 90) {
      return 'in-repayment delinquent3';
    } else {
      return 'in-repayment delinquent4';
    }
  }

  async getApplicationInfo(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting application info with params:',
      `${AdminDashboardService.name}#getApplicationInfo`,
      requestId,
      screenTrackingId,
    );

    const screenTrackingDocument = await this.ScreenTrackingModel.findById(
      screenTrackingId,
    ).populate('user');
    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (!screenTrackingDocument.user) {
      const errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const user: UserDocument = screenTrackingDocument.user as UserDocument;
    const PracticeManagementDocument: PaymentManagement = await this.PaymentManagementModel.findOne(
      {
        user: user._id,
      },
    );

    let ricSignature: string | undefined;
    const esignature: EsignatureDocument | null = await this.esignatureModel.findOne(
      { user },
    );
    if (esignature) {
      const signature = await this.s3Service.downloadFile(
        esignature.signaturePath,
        requestId,
      );
      ricSignature = `data:${
        signature.ContentType
      };base64,${signature.Body.toString('base64')}`;
    }

    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking: screenTrackingId,
      },
    );

    let collectionAdmin = 'Unassigned';
    let collectionEmail = '';
    if (
      paymentManagement?.collectionAssignedUser &&
      paymentManagement?.collectionAssignedUser != ''
    ) {
      const response = await this.adminService.getAdminById(
        `${paymentManagement?.collectionAssignedUser}`,
        '',
      );
      collectionAdmin = `${response.userName}`;
      collectionEmail = `${response.email}`;
    }

    const employmentHistory = await this.employmentHistoryModel.findOne({
      user: user._id,
    });
    let financingStatus = PracticeManagementDocument?.status;
    if (financingStatus === 'in-repayment prime') {
      financingStatus = 'in-repayment';
    }
    const { PREFIX_REFERENCE } = config();
    const applicationInfo = {
      annualIncome: screenTrackingDocument.annualIncome,
      city: user.city,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      financingReferenceNumber: `${PREFIX_REFERENCE}_${paymentManagement.loanReference}`,
      financingStatus: financingStatus,
      lastProfileUpdatedAt: (user as any).updatedAt,
      monthlyIncome: screenTrackingDocument.annualIncome / 12,
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: user?.phones[0]?.phone,
      phones: user.phones,
      preDTIdebt: screenTrackingDocument.preDTIMonthlyAmount,
      preDTIdebtInPercents: screenTrackingDocument.preDTIPercentValue,
      selectedOffer: screenTrackingDocument.offerData,
      ricSignature: ricSignature,
      registeredAt: (user as any).createdAt,
      requestedAmount: screenTrackingDocument.requestedAmount,
      ssnNumber: user.ssnNumber,
      state: user.state,
      street: user.street,
      unitApt: user.unitApt,
      userId: user._id,
      userReference: user.userReference,
      zipCode: user.zipCode,
      collectionAdmin: collectionAdmin,
      collectionEmail: collectionEmail,
      promiseToPay: paymentManagement?.promiseToPay,
      delinquencyDays: paymentManagement?.delinquentDays,
      employerName: employmentHistory?.employerName || 'N/A',
      employerPhoneNumber: employmentHistory?.employerPhone || 'N/A',
    };

    this.logger.log(
      'Returning application info: ',
      `${AdminDashboardService.name}#getApplicationInfo`,
      requestId,
      applicationInfo,
    );

    return applicationInfo;
  }

  async getRulesDetails(screenTrackingId: string, requestId: string) {
    const screenTrackingDocument = await this.ScreenTrackingModel.findById(
      screenTrackingId,
    ).populate('user');
    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (!screenTrackingDocument.user) {
      const errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const user: UserDocument = screenTrackingDocument.user as UserDocument;
    const employmentHistory = await this.employmentHistoryModel.findOne({
      user: user._id,
    });

    const applicationInfo = {
      annualIncome: screenTrackingDocument.annualIncome,
      financingReferenceNumber: screenTrackingDocument.applicationReference,
      monthlyIncome: screenTrackingDocument.annualIncome / 12,
      name: `${user.firstName} ${user.lastName}`,
      selectedOffer: screenTrackingDocument.offerData,
      requestedAmount: screenTrackingDocument.requestedAmount,
      employerName: employmentHistory?.employerName || 'N/A',
      employerPhoneNumber: employmentHistory?.employerPhone || 'N/A',
      rulesDetails: screenTrackingDocument.rulesDetails,
    };

    this.logger.log(
      'Returning application info: ',
      `${AdminDashboardService.name}#getApplicationInfo`,
      requestId,
      applicationInfo,
    );

    return applicationInfo;
  }

  async getCreditReport(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting credit report with params:',
      `${AdminDashboardService.name}#getCreditReport`,
      requestId,
      screenTrackingId,
    );

    const screenTrackingDocument = await this.ScreenTrackingModel.findById(
      screenTrackingId,
    ).populate('user');
    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      throw new BadRequestException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (!screenTrackingDocument.user) {
      const errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      throw new BadRequestException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const arr = screenTrackingDocument.transUnion as any[];

    const getTransUnion = (id) => this.transunionService.getById(id);
    const transUnionPromises = Array.isArray(screenTrackingDocument.transUnion)
      ? arr.map(getTransUnion)
      : [getTransUnion(screenTrackingDocument.transUnion)];

    const transUnions = await Promise.all(transUnionPromises);

    const user: UserDocument = screenTrackingDocument.user as UserDocument;
    const response = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        ssn: user.ssnNumber,
        creditScore: screenTrackingDocument.creditScore,
      },
      creditInfo: {
        tradeInfo: transUnions[0],
      },
    };

    this.logger.log(
      'Got credit report:',
      `${AdminDashboardService.name}#getCreditReport`,
      requestId,
      response,
    );

    return response;
  }

  async getClarityReport(screenTrackingId: string, requestId: string) {}

  async queryApplicationsByStatus(
    matchCriteria: Record<string, any>,
    page: number,
    perPage: number,
  ): Promise<{ total: number; items: Record<string, any>[] }> {
    const queryResult = (
      await this.PaymentManagementModel.aggregate([
        {
          $lookup: {
            from: 'user',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
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
        {
          $lookup: {
            from: 'practicemanagement',
            localField: 'practiceManagement',
            foreignField: '_id',
            as: 'practiceManagement',
          },
        },
        {
          $unwind: '$practiceManagement',
        },
        {
          $match: matchCriteria,
        },
        ...this.getPaginationAggregation(page, perPage),
      ])
    )[0] ?? { items: [], total: 0 };
    return queryResult;
  }

  async getPaymentSchedule(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking: screenTrackingId,
      },
    );
    const screenTracking: ScreenTrackingDocument | null = await this.ScreenTrackingModel.findById(
      screenTrackingId,
    );
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    const response: PaymentManagementDocument = paymentManagement;
    // await this.checkPromoAvailability(paymentManagement, requestId);
    response.status =
      response.status === 'in-repayment prime'
        ? 'in-repayment'
        : response.status;
    const ledger = this.ledgerService.getPaymentLedger(
      response,
      moment().startOf('day').toDate(),
      requestId,
    );
    response.payOffAmount = ledger.payoff;
    response.screenTracking = screenTracking;

    return response;
  }

  async checkPromoAvailability(
    paymentManagement: PaymentManagementDocument,
    requestId: string,
  ): Promise<PaymentManagementDocument> {
    this.logger.log(
      `Checking promo availability for payment management id ${paymentManagement._id}`,
      `${AdminDashboardService.name}#checkPromoAvailability`,
      requestId,
    );
    if (paymentManagement.promoStatus === 'unavailable') {
      this.logger.log(
        'Promo is unavailable',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    } else if (
      moment()
        .startOf('day')
        .isAfter(
          moment(paymentManagement.loanStartDate)
            .add(paymentManagement.promoTermCount, 'months')
            .startOf('day'),
        )
    ) {
      this.logger.log(
        'Setting promoStatus to unavailable',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
      await this.PaymentManagementModel.updateOne(
        { _id: paymentManagement._id },
        { promoStatus: 'unavailable' },
      );
      this.logger.log(
        'promoStatus set to unavailable',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    } else {
      this.logger.log(
        'Promo is still available',
        `${AdminDashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    }

    return paymentManagement;
  }

  async changeMonthlyPaymentAmount(
    changePaymentAmountDto: ChangePaymentAmountDto,
    requestId: string,
  ) {
    const { screenTracking, amount } = changePaymentAmountDto;
    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking,
      },
    );
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTracking}`,
          requestId,
        ),
      );
    }

    const { minimumPaymentAmount, payOffAmount } = paymentManagement;
    if (amount < minimumPaymentAmount || amount > payOffAmount) {
      this.logger.error(
        `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
        `${AdminDashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
          requestId,
        ),
      );
    }

    const today: Date = moment().startOf('day').toDate();
    const loanSettings = await this.loanSettingsService.getLoanSettings();
    const lateFeeThreshold: Date = moment(today)
      .subtract(loanSettings.lateFeeGracePeriod, 'day')
      .startOf('day')
      .toDate();

    const newPaymentSchedule = this.paymentService.amortizeSchedule(
      amount,
      paymentManagement,
      requestId,
      lateFeeThreshold,
      loanSettings.lateFee || 0,
    );

    await this.PaymentManagementModel.findByIdAndUpdate(paymentManagement._id, {
      currentPaymentAmount: amount,
      paymentSchedule: newPaymentSchedule,
    });
  }

  async changeMonthlyPromoAmount(
    changePaymentAmountDto: ChangePaymentAmountDto,
    requestId: string,
  ) {
    const { screenTracking, amount } = changePaymentAmountDto;
    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking,
      },
    );
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTracking}`,
          requestId,
        ),
      );
    }

    const { minimumPaymentAmount, payOffAmount } = paymentManagement;
    if (amount < minimumPaymentAmount || amount > payOffAmount) {
      this.logger.error(
        `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
        `${AdminDashboardService.name}#changeMonthlyPaymentAmount`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          `Amount should be higher than ${minimumPaymentAmount} and lower than ${payOffAmount}`,
          requestId,
        ),
      );
    }

    const today: Date = moment().startOf('day').toDate();
    const loanSettings = await this.loanSettingsService.getLoanSettings();
    const lateFeeThreshold: Date = moment(today)
      .subtract(loanSettings.lateFeeGracePeriod, 'day')
      .startOf('day')
      .toDate();
    const newPaymentSchedule = this.paymentService.amortizeSchedule(
      amount,
      paymentManagement,
      requestId,
      lateFeeThreshold,
      loanSettings.lateFee,
      true,
    );

    await this.PaymentManagementModel.findByIdAndUpdate(paymentManagement._id, {
      currentPaymentAmount: amount,
      paymentSchedule: newPaymentSchedule,
    });
  }

  processApplicationByStatusDataFields(
    status: PaymentManagement['status'],
  ): { data: string; dataType: 'string' | 'currency' }[] {
    const dataFields: {
      data: string;
      dataType: 'string' | 'currency';
    }[] = [
      {
        data: 'user.firstName',
        dataType: 'string',
      },
      {
        data: 'user.lastName',
        dataType: 'string',
      },
      {
        data: 'user.phones.0.phone',
        dataType: 'string',
      },
      {
        data: 'user.email',
        dataType: 'string',
      },
      {
        data: 'practiceManagement.location',
        dataType: 'string',
      },
      {
        data: 'loanReference',
        dataType: 'string',
      },
      {
        data: 'screenTracking.lastLevel',
        dataType: 'string',
      },
      {
        data: 'practiceManagement.location',
        dataType: 'string',
      },
      {
        data: 'user.userReference',
        dataType: 'string',
      },
      {
        data: 'screenTracking.applicationReference',
        dataType: 'string',
      },
    ];

    if (status !== 'denied') {
      dataFields.push(
        {
          data: 'screenTracking.approvedUpTo',
          dataType: 'currency',
        },
        {
          data: 'screenTracking.offerData.loanAmount',
          dataType: 'currency',
        },
      );
    }

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
          total: {
            $sum: 1,
          },
          items: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $unwind: '$items',
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
          total: { $first: '$total' },
          items: {
            $push: '$items',
          },
        },
      },
      {
        $project: { _id: 0 },
      },
    ];
  }

  // async forgivePayment1(screenTrackingId: string, requestId: string) {
  //   const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
  //     {
  //       screenTracking: screenTrackingId,
  //     },
  //   );
  //   if (!paymentManagement) {
  //     this.logger.log(
  //       'Payment schedule not found',
  //       `${AdminDashboardService.name}#getPaymentSchedule`,
  //       requestId,
  //     );
  //     throw new NotFoundException(
  //       this.appService.errorHandler(
  //         404,
  //         `Payment management not found for user id ${screenTrackingId}`,
  //         requestId,
  //       ),
  //     );
  //   }
  //   let index = 0;
  //   paymentManagement.paymentSchedule.forEach(async (scheduleItem) => {
  //     const d1 = new Date(scheduleItem.date);
  //     const date1 =
  //       d1.getFullYear() + '/' + (d1.getMonth() + 1) + '/' + d1.getDate();
  //     const d2 = new Date(paymentManagement.nextPaymentSchedule);
  //     const date2 =
  //       d2.getFullYear() + '/' + (d2.getMonth() + 1) + '/' + d2.getDate();
  //     const today = moment().startOf('day').toDate();
  //     this.logger.log(
  //       'Payment schedule for match',
  //       `\n\n\n${date1}\n\n\n${date2}\n\n\n${index}\n\n\n${scheduleItem.status}\n\n\n#getPaymentSchedule`,
  //       requestId,
  //     );
  //     if (scheduleItem.status === 'opened' && index == 1) {
  //       index = 2;
  //       //paymentManagement.nextPaymentSchedule = scheduleItem.date;
  //     }
  //     if (scheduleItem.status === 'opened' && index === 0) {
  //       index = 1;
  //       const { preview } = this.paymentService.previewPayment(
  //         paymentManagement,
  //         scheduleItem.amount,
  //         scheduleItem.date,
  //         requestId,
  //       );

  //       // const updatedPaymentManagement = {
  //       //   paymentSchedule: preview.paymentSchedule,
  //       //   payOffAmount: paymentManagement.payOffAmount,
  //       //   status: paymentManagement.status,
  //       //   promoStatus: paymentManagement.promoStatus,
  //       // };
  //       scheduleItem.paymentReference = 'Waived';
  //       scheduleItem.paymentId = '';
  //       scheduleItem.status = 'paid';
  //       scheduleItem.isWaived = true;
  //       scheduleItem.paidInterest = scheduleItem.interest;
  //       paymentManagement.payOffAmount = preview.payoff;
  //       scheduleItem.payment = scheduleItem.amount;
  //       scheduleItem.paidPrincipal = scheduleItem.principal;
  //       scheduleItem.paymentDate = today;
  //       scheduleItem.transactionMessage = 'Payment is waived';
  //       scheduleItem.transId = '';

  //       // await this.PaymentManagementModel.updateOne(
  //       //   { _id: paymentManagement._id },
  //       //   updatedPaymentManagement,
  //       // );
  //     }
  //   });
  //   const PaymentManagement: PaymentManagementDocument = new this.PaymentManagementModel(
  //     paymentManagement,
  //   );
  //   await PaymentManagement.save();
  //   return paymentManagement;
  // }

  async forgivePayment(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking: screenTrackingId,
      },
    );
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }
    let index = 0;
    paymentManagement.paymentSchedule.forEach((scheduleItem) => {
      const today = moment().startOf('day').toDate();
      if (scheduleItem.status === 'opened' && index == 1) {
        index = 2;
        //paymentManagement.nextPaymentSchedule = scheduleItem.date;
      }
      if (scheduleItem.status === 'opened' && index === 0) {
        index = 1;
        scheduleItem.isWaived = true;
        scheduleItem.status = 'paid';
        scheduleItem.paymentDate = today;
        scheduleItem.paymentReference = 'Waived';
        scheduleItem.payment = scheduleItem.amount;
        scheduleItem.paidInterest = scheduleItem.interest;
        scheduleItem.paidPrincipal = scheduleItem.principal;
        paymentManagement.payOffAmount =
          paymentManagement.payOffAmount - scheduleItem.principal;
        scheduleItem.paymentId = '';
        scheduleItem.payment = scheduleItem.amount;
        scheduleItem.paymentDate = today;
        scheduleItem.transactionMessage = 'Payment is waived';
        scheduleItem.transId = '';
      }
    });
    const PaymentManagement: PaymentManagementDocument = new this.PaymentManagementModel(
      paymentManagement,
    );
    await PaymentManagement.save();
    return paymentManagement;
  }

  async forgiveLatefee(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking: screenTrackingId,
      },
    );
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    paymentManagement.paymentSchedule.forEach((scheduleItem) => {
      if (scheduleItem.fees != 0 && scheduleItem.status === 'opened') {
        scheduleItem.fees = 0;
      }
    });
    const PaymentManagement: PaymentManagementDocument = new this.PaymentManagementModel(
      paymentManagement,
    );
    await PaymentManagement.save();
    return PaymentManagement;
  }

  async forgiveSingleLatefee(
    screenTrackingId: string,
    requestId: string,
    transactionId: string,
  ) {
    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking: screenTrackingId,
      },
    );

    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    paymentManagement.paymentSchedule.forEach((scheduleItem) => {
      if (scheduleItem.transactionId === transactionId) {
        if (scheduleItem.fees != 0 && scheduleItem.status === 'opened') {
          scheduleItem.fees = 0;
        }
      }
    });

    const PaymentManagement: PaymentManagementDocument = new this.PaymentManagementModel(
      paymentManagement,
    );
    await PaymentManagement.save();
    return PaymentManagement;
  }

  async deferPayment(screenTrackingId: string, requestId: string) {
    const paymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
      {
        screenTracking: screenTrackingId,
      },
    );
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${AdminDashboardService.name}#getPaymentSchedule`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    const paymentScheduleItems: IPaymentScheduleItem[] = paymentManagement.paymentSchedule.filter(
      (scheduleItem) => scheduleItem.status === 'opened',
    );
    paymentScheduleItems.forEach(
      (scheduleItem, index, paymentScheduleItems) => {
        if (index + 1 < paymentScheduleItems.length) {
          scheduleItem.fees += paymentScheduleItems[index + 1].fees;
          paymentScheduleItems[index + 1].fees = 0;
        }
        scheduleItem.date = moment(scheduleItem.date).add(1, 'months').toDate();
      },
    );
    const updatedPaymentManagement = {
      paymentSchedule: paymentManagement.paymentSchedule,
    };

    await this.PaymentManagementModel.updateOne(
      { _id: paymentManagement._id },
      updatedPaymentManagement,
    );
    return PaymentManagement;
  }
}
