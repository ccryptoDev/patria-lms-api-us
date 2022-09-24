import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';

import {
  PaymentManagement,
  PaymentManagementDocument,
} from '../../loans/payments/payment-management/payment-management.schema';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../user/screen-tracking/screen-tracking.schema';
import { LoggerService } from '../../logger/logger.service';
import {
  UserDocuments,
  UserDocumentsDocument,
} from '../documents/documents.schema';
import { User, UserDocument } from '../user.schema';
import { UserConsent, UserConsentDocument } from '../consent/consent.schema';
import { AppService } from '../../app.service';
import { LedgerService } from '../../loans/ledger/ledger.service';
import { LoanpaymentproService } from '../../loans/payments/loanpaymentpro/loanpaymentpro.service';
import {
  PaymentScheduleHistory,
  PaymentScheduleHistoryDocument,
} from '../../loans/payments/payment-schedule-history/payment-schedule-history.schema';
import { PaymentService } from '../../loans/payments/payment.service';
import { ChangePaymentAmountDto } from '../../loans/admin-dashboard/dtos/change-payment-amount.dto';
import { LoanSettingsService } from '../../loans/loan-settings/loan-settings.service';
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(UserDocuments.name)
    private readonly userDocumentsModel: Model<UserDocumentsDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(UserConsent.name)
    private readonly userConsentModel: Model<UserConsentDocument>,
    private readonly ledgerService: LedgerService,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly paymentService: PaymentService,
    private readonly loanSettingsService: LoanSettingsService,
  ) { }

  async getDashboard(userId: string, requestId: string) {
    // const userDocuments: UserDocumentsDocument | null =
    //   await this.userDocumentsModel
    //     .findOne({
    //       user: userId,
    //     })
    //     .populate('user');

    // if (!userDocuments) {
    //   this.logger.error(
    //     "User's documents not found",
    //     `${DashboardService.name}#getDashboard`,
    //     requestId,
    //   );
    //   throw new NotFoundException(
    //     this.appService.errorHandler(
    //       404,
    //       `Documents not found for user id ${userId}`,
    //       requestId,
    //     ),
    //   );
    // }
    // if (!userDocuments.user) {
    //   this.logger.error(
    //     'User not found',
    //     `${DashboardService.name}#getDashboard`,
    //     requestId,
    //   );
    //   throw new NotFoundException(
    //     this.appService.errorHandler(
    //       404,
    //       `User id ${userId} not found`,
    //       requestId,
    //     ),
    //   );
    // }

    const userDocuments: UserDocuments[] | null = await this.userDocumentsModel
      .find({
        user: userId,
      })
      .lean();
    // this.logger.log(
    //   'Got user dashboard:',
    //   `${DashboardService.name}#userDocuments`,
    //   requestId,
    //   userDocuments,
    // );
    // user documents
    const documents: any = {};

    if (userDocuments.length > 0) {
      userDocuments.forEach((item) => {
        const {
          passport,
          driversLicense,
          paystub,
          otherDoc,
          otherDocTitle,
          proofOfResidence,
        } = item;
        if (passport) documents.passportPath = passport;
        if (driversLicense) documents.driversLicensePaths = driversLicense;
        if (proofOfResidence) documents.proofOfResidencePath = proofOfResidence;
        if (paystub) documents.paystubPath = paystub;
        if (otherDoc) documents.otherDocPath = otherDoc;
        if (otherDoc) documents.otherDocTitle = otherDocTitle;
      });
    }

    // if (userDocuments && userDocuments[0]?.passport) {
    //   documents.passportPath = userDocuments?.passport;
    // } else if (userDocuments?.driversLicense) {
    //   documents.driversLicensePaths = userDocuments?.driversLicense;
    // }
    // documents.userDocuments = userDocuments || [];

    const userData: UserDocument = await this.userModel.findById(userId).lean();
    documents.user = userData;

    const user: UserDocument = documents.user as UserDocument;

    const { firstName, lastName, street, unitApt, city, state, zipCode } = user;
    const name = `${firstName} ${lastName}`;
    const address = `${street} ${unitApt} ${city} ${state} ${zipCode}`;

    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        user: userId,
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found',
        `${DashboardService.name}#getDashboard`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Payment management not found for this user',
          requestId,
        ),
      );
    }

    const paymentManagementData: PaymentManagementDocument =
      await this.checkPromoAvailability(paymentManagement, requestId);
    const ledger = this.ledgerService.getPaymentLedger(
      paymentManagementData,
      moment().startOf('day').toDate(),
      requestId,
    );
    paymentManagementData.payOffAmount = ledger.payoff;

    const userConsents: UserConsentDocument[] | null =
      await this.userConsentModel.find({ user: userId });
    if (!userConsents || userConsents.length <= 0) {
      this.logger.error(
        'User consents not found',
        `${DashboardService.name}#getDashboard`,
        requestId,
      );
      // throw new NotFoundException(
      //   this.appService.errorHandler(
      //     404,
      //     'No consents found for this user',
      //     requestId,
      //   ),
      // );
    }

    let smsPolicyPath = '';
    let esignaturePath = '';
    let ricPath = '';
    const eftaConsents = [];

    userConsents.forEach((consent) => {
      if (consent.agreementDocumentPath) {
        smsPolicyPath = consent.agreementDocumentPath;
      } else if (
        consent.agreementDocumentPath //&& consent.documentKey === '120'
      ) {
        esignaturePath = consent.agreementDocumentPath;
      } else if (consent.agreementDocumentPath) {
        ricPath = consent.agreementDocumentPath;
      } else if (
        consent.agreementDocumentPath &&
        consent.documentKey === '132'
      ) {
        eftaConsents.push(consent);
      }
    });

    const userAccountsData = await this.loanPaymentProService.getUserCards(
      paymentManagementData.screenTracking.toString(),
      requestId,
    );

    this.logger.log(
      'Got user dashboard:NEW',
      `${DashboardService.name}#documents`,
      requestId,
      documents,
    );

    const response = {
      name,
      address,
      phone: user?.phones?.[0] || user?.phoneNumber || '',
      email: user.email,
      smsPolicyPath,
      esignaturePath,
      ricPath,
      eftaConsents,
      paymentManagementData,
      userAccountsData,
      ...documents,
    };
    this.logger.log(
      'Got user dashboard:',
      `${DashboardService.name}#getDashboard`,
      requestId,
    );

    return response;
  }
  async checkPromoAvailability(
    paymentManagement: PaymentManagementDocument,
    requestId: string,
  ): Promise<PaymentManagementDocument> {
    this.logger.log(
      `Checking promo availability for payment management id ${paymentManagement._id}`,
      `${DashboardService.name}#checkPromoAvailability`,
      requestId,
    );
    if (paymentManagement.promoStatus === 'unavailable') {
      this.logger.log(
        'Promo is unavailable',
        `${DashboardService.name}#checkPromoAvailability`,
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
        `${DashboardService.name}#checkPromoAvailability`,
        requestId,
      );
      await this.paymentManagementModel.updateOne(
        { _id: paymentManagement._id },
        { promoStatus: 'unavailable' },
      );
      this.logger.log(
        'promoStatus set to unavailable',
        `${DashboardService.name}#checkPromoAvailability`,
        requestId,
      );
    } else {
      this.logger.log(
        'Promo is still available',
        `${DashboardService.name}#checkPromoAvailability`,
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
    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${DashboardService.name}#changeMonthlyPaymentAmount`,
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
        `${DashboardService.name}#changeMonthlyPaymentAmount`,
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
    );

    await this.paymentManagementModel.findByIdAndUpdate(paymentManagement._id, {
      currentPaymentAmount: amount,
      paymentSchedule: newPaymentSchedule,
    });
  }

  async enableAutopay(paymentManagementId: string) {
    await this.paymentService.triggerAutoPay([], paymentManagementId, true);
  }
}
