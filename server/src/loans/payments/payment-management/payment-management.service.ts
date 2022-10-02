import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import moment from 'moment';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { nanoid } from 'nanoid';

import {
  PaymentManagement,
  PaymentManagementDocument,
} from './payment-management.schema';
import {
  PaymentScheduleHistory,
  PaymentScheduleHistoryDocument,
} from '../payment-schedule-history/payment-schedule-history.schema';
import {
  UserConsent,
  UserConsentDocument,
} from '../../../user/consent/consent.schema';
import { MathExtService } from '../../mathext/mathext.service';
import { CountersService } from '../../../counters/counters.service';
import { OffersService } from '../../../user/offers/offers.service';
import { LoggerService } from '../../../logger/logger.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../../user/screen-tracking/screen-tracking.schema';
import { IPaymentScheduleItem } from './payment-schedule-item.interface';
import { AppService } from '../../../app.service';
import {
  LoanPaymentProCardToken,
  LoanPaymentProCardTokenDocument,
} from '../loanpaymentpro/schemas/loanpaymentpro-card-token.schema';
import { FlexPayService } from '../flex-pay/flex-pay.service';
import { MakePaymentFlexDto } from '../validation/makePayment.dto';
import { User, UserDocument } from '../../../user/user.schema';
import { TransactionStatus } from '../flex-pay/flex.schema';

@Injectable()
export class PaymentManagementService {
  constructor(
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(PaymentScheduleHistory.name)
    private readonly paymentScheduleHistoryModel: Model<PaymentScheduleHistoryDocument>,
    @InjectModel(UserConsent.name)
    private readonly userConsentModel: Model<UserConsentDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(LoanPaymentProCardToken.name)
    private readonly loanPaymentProCardTokenModel: Model<LoanPaymentProCardTokenDocument>,
    private readonly mathExtService: MathExtService,
    private readonly countersService: CountersService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly flexPayService: FlexPayService,
  ) {}

  async testAmortization(selectedOffer) {
    const approvedAmount =
      selectedOffer.financedAmount + (selectedOffer.downPayment || 0);
    const apr = selectedOffer.apr;
    const maturityDate = moment(
      this.getFirstPaymentDate(selectedOffer.loanStartDate),
    )
      .startOf('day')
      .add(selectedOffer.term, 'weeks')
      .toDate();
    selectedOffer.firstPaymentDate = this.getFirstPaymentDate(
      selectedOffer.loanStartDate,
    );

    const paymentSchedule: any[] = this.getLoanPaymentSchedule(
      selectedOffer,
      false,
      '',
    );

    const paymentManagementObject: any = {
      loanStartDate: moment().startOf('day').toDate(),
      maturityDate: maturityDate,
      nextPaymentSchedule: this.getFirstPaymentDate(
        selectedOffer.loanStartDate,
      ),
      loanTermCount: selectedOffer.term,
      apr,
      // canRunAutomaticPayment: true,
      currentPaymentAmount: selectedOffer.promoSelected
        ? selectedOffer.promoMonthlyPayment
        : selectedOffer.monthlyPayment,
      // initialPaymentSchedule: paymentSchedule,
      interestApplied: parseFloat(parseFloat('' + apr / 52).toFixed(7)),
      // loanReference: `LN_${loanReferenceData.sequenceValue}`,
      minimumPaymentAmount: selectedOffer.monthlyPayment,
      payOffAmount: approvedAmount,
      // practiceManagement: 'test',
      principalAmount: approvedAmount,
      // promoPaymentAmount: selectedOffer.promoMonthlyPayment,
      // promoStatus: 'available',
      // promoTermCount: selectedOffer.promoTerm,
      // screenTracking: '',
      // status: 'in-repayment prime',
      // user: '',
      paymentSchedule,
    };

    this.logger.log(
      'Payment schedule created',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      '',
      paymentManagementObject,
    );

    return paymentManagementObject;
  }

  async createLoanPaymentSchedule(
    screenTracking: ScreenTrackingDocument,
    requestId: string,
  ) {
    const { selectedOffer } = screenTracking;
    const approvedAmount =
      selectedOffer.financedAmount + (selectedOffer.downPayment || 0);
    const promoSelected = selectedOffer.promoSelected;
    const apr = promoSelected ? selectedOffer.apr : selectedOffer.apr;
    const maturityDate = moment(this.getFirstPaymentDate(moment().toDate()))
      .startOf('day')
      .add(Math.floor(selectedOffer.term * 4.34524) - 1, 'weeks')
      .toDate();
    selectedOffer.firstPaymentDate = this.getFirstPaymentDate(
      selectedOffer.loanStartDate,
    );
    selectedOffer.monthlyPayment = selectedOffer.regularPayment;
    // selectedOffer.monthlyPayment = this.offersService.calcMonthlyPayment(
    //   apr,
    //   approvedAmount,
    //   0,
    //   selectedOffer.term,
    //   requestId,
    // );

    const paymentSchedule: any[] = this.getLoanPaymentSchedule(
      selectedOffer,
      false,
      requestId,
    );

    const loanReferenceData = await this.countersService.getNextSequenceValue(
      'loan',
      requestId,
    );
    // const loanReferenceData = { sequenceValue: '52' };

    const paymentManagementObject: any = {
      apr,
      canRunAutomaticPayment: !screenTracking.skipAutoPay,
      currentPaymentAmount: selectedOffer.promoSelected
        ? selectedOffer.promoMonthlyPayment
        : selectedOffer.monthlyPayment,
      initialPaymentSchedule: paymentSchedule,
      interestApplied: selectedOffer.interestRate,
      loanReference: `LN_${loanReferenceData.sequenceValue}`,
      loanStartDate: moment().startOf('day').toDate(),
      loanTermCount: selectedOffer.term,
      maturityDate: maturityDate,
      minimumPaymentAmount: selectedOffer.monthlyPayment,
      nextPaymentSchedule: this.getFirstPaymentDate(
        selectedOffer.loanStartDate,
      ),
      paymentSchedule,
      payOffAmount: approvedAmount,
      practiceManagement: screenTracking.practiceManagement,
      principalAmount: approvedAmount,
      promoPaymentAmount: selectedOffer.promoMonthlyPayment,
      promoSelected,
      promoStatus: 'available',
      promoTermCount: selectedOffer.promoTerm,
      screenTracking: screenTracking._id,
      status: 'pending',
      user: screenTracking.user,
    };
    this.logger.log(
      'Creating payment schedule with params:',
      `${screenTracking._id}\n${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      // paymentManagementObject,
    );
    const isPaymentManagementExist = await this.paymentManagementModel.findOne({
      screenTracking: screenTracking._id,
    });
    let paymentManagement = null;
    if (isPaymentManagementExist) {
      paymentManagement = await this.paymentManagementModel.findOneAndUpdate(
        { screenTracking: screenTracking._id },
        paymentManagementObject,
        { new: true, upsert: true },
      );
    } else {
      paymentManagement = await this.paymentManagementModel.create(
        paymentManagementObject as any,
      );
    }

    this.logger.log(
      'Payment schedule created',
      `${PaymentManagementService.name}#createLoanPaymentSchedule`,
      requestId,
      paymentManagementObject,
    );

    // this.logger.log(
    //   'Saving original payment schedule with params:',
    //   `${PaymentManagementService.name}#createLoanPaymentSchedule`,
    //   requestId,
    //   paymentManagementObject,
    // );
    // await this.paymentScheduleHistoryModel.create(
    //   paymentManagementObject as any,
    // );
    // const updateConsentAgreementCriteria = {
    //   user: screenTracking.user,
    //   loanUpdated: 1,
    //   paymentManagement: { $exists: false },
    // };

    // this.logger.log(
    //   'Updating user consent agreement with params:',
    //   `${PaymentManagementService.name}#createLoanPaymentSchedule`,
    //   requestId,
    //   updateConsentAgreementCriteria,
    // );
    // const userConsentAgreements: UserConsentDocument[] =
    //   await this.userConsentModel.updateMany(updateConsentAgreementCriteria, {
    //     paymentManagement: paymentManagement._id,
    //   });

    return paymentManagement;
  }

  async disbursePaymentToUser(payload, requestId) {
    try {
      const { screenTrackingId } = payload;
      const screenData = await this.screenTrackingModel
        .findOne({ _id: screenTrackingId })
        .populate('user');
      // .lean();

      this.logger.log(
        JSON.stringify(screenData, null, 4),
        'disbursePaymentToUser#screenData',
        requestId,
      );

      if (!screenData) {
        throw new HttpException('User Not Found', 404);
      }

      if (screenData.isDisbursed) {
        throw new HttpException('Loan is already disbursed', 400);
      }

      if (screenData.lastlevel !== 7) {
        throw new HttpException('Invalid screen level', 400);
      }

      const user: any = screenData.user;
      delete screenData.user;

      const { assignedLoan: amount } = screenData.offerData[0];

      this.logger.log(amount, 'disbursePaymentToUser#amount', requestId);

      const disbursementAccountData = await this.loanPaymentProCardTokenModel.findOne(
        {
          user: user.id,
          isDefault: true,
        },
      );

      this.logger.log(
        JSON.stringify(disbursementAccountData, null, 4),
        'disbursePaymentToUser#disbursementAccountData',
        requestId,
      );

      let disbursementResponse;

      if (disbursementAccountData.paymentType === 'CARD') {
        disbursementResponse = await this.flexPayService.cardInstantTransaction(
          disbursementAccountData,
          screenData,
          amount,
          requestId,
        );
      }

      if (disbursementAccountData.paymentType === 'ACH') {
        const achDataPayload = {
          screenTracking: screenData,
          user,
          amount,
          bankData: {
            routingNumber: disbursementAccountData.routingNumber,
            accountNumber: disbursementAccountData.accountNumber,
          },
        };

        disbursementResponse = await this.flexPayService.disbursePaymentViaAch(
          achDataPayload,
          requestId,
        );
      }

      if (!disbursementResponse?.ok) {
        throw disbursementResponse?.error || 'Error on disbursement';
      }

      await this.screenTrackingModel.updateOne(
        { _id: screenTrackingId },
        {
          $set: {
            isDisbursed: true,
            isCompleted: true,
            lastLevel: 8,
            lastlevel: 8,
          },
        },
      );

      await this.paymentManagementModel.updateOne(
        { screenTracking: screenTrackingId },
        { status: 'in-repayment' },
      );

      this.logger.log(
        disbursementResponse,
        'disbursePaymentToUser#disbursePaymentToUser',
        requestId,
      );
      return disbursementResponse;
    } catch (error) {
      this.logger.error(error, 'disbursePaymentToUser', requestId);
      throw new HttpException(error.message || error, 400);
    }
  }

  getFirstPaymentDate(loanStartDate: Date): Date {
    const dayINeed = 5; // for Friday
    const today = moment(loanStartDate).isoWeekday();

    // if we haven't yet passed the day of the week that I need:
    if (today < 2) {
      // then just give me this week's instance of that day
      return moment(loanStartDate).isoWeekday(dayINeed).startOf('day').toDate();
    } else {
      // otherwise, give me *next week's* instance of that same day
      return moment(loanStartDate)
        .add(1, 'weeks')
        .isoWeekday(dayINeed)
        .startOf('day')
        .toDate();
    }
  }

  getLoanPaymentSchedule(
    selectedOffer: any,
    forRIC = false,
    requestId: string,
  ): IPaymentScheduleItem[] {
    // const selectedOffer = screenTracking.selectedOffer;
    this.logger.log(
      'Creating payment schedule with params:',
      `${PaymentManagementService.name}#getLoanPaymentSchedule`,
      requestId,
      { selectedOffer, forRIC },
    );
    const approvedAmount = selectedOffer.financedAmount;
    const loanInterestRate = selectedOffer.apr;
    const monthlyPayment = selectedOffer.monthlyPayment;
    const loanTerm = Math.floor(selectedOffer.term * 4.348);
    const loanStartDate = selectedOffer.loanStartDate;
    const firstPaymentDate = selectedOffer.firstPaymentDate;
    // if (forRIC) {
    //   loanInterestRate = selectedOffer.interestRate;
    //   monthlyPayment = selectedOffer.monthlyPayment;
    //   loanTerm = selectedOffer.term;
    // }

    const paymentSchedule: IPaymentScheduleItem[] = [];
    const amortizationSchedule = this.mathExtService.makeAmortizationSchedule(
      approvedAmount,
      monthlyPayment,
      loanInterestRate,
      loanTerm,
      requestId,
      loanStartDate,
      firstPaymentDate,
    );
    amortizationSchedule.schedule.forEach((item) => {
      paymentSchedule.push({
        amount: item.payment,
        date: moment(this.getFirstPaymentDate(loanStartDate))
          .add(item.id - 1, 'weeks')
          .toDate(),
        endPrincipal: item.endBalance,
        fees: 0,
        interest: item.interest,
        week: item.id,
        paidFees: 0,
        paidInterest: 0,
        paidPastDueInterest: 0,
        paidPrincipal: 0,
        pastDueInterest: 0,
        payment: 0,
        paymentType: 'automatic',
        principal: item.principal,
        startPrincipal: item.startBalance,
        status: 'opened',
        transactionId: nanoid(10),
      });
    });
    this.logger.log(
      'Payment schedule created:',
      `${PaymentManagementService.name}#getLoanPaymentSchedule`,
      requestId,
      paymentSchedule,
    );

    return paymentSchedule;
  }

  async createPaymentManagement(
    screenTracking: ScreenTrackingDocument,
    status: 'approved' | 'pending' | 'denied',
    requestId: string,
  ) {
    const existingPaymentManagement = await this.paymentManagementModel.findOne(
      { screenTracking: screenTracking._id },
    );
    if (existingPaymentManagement) {
      return;
    }

    const paymentObj: any = {
      practiceManagement: screenTracking.practiceManagement,
      screenTracking: screenTracking._id,
      status,
      user: screenTracking.user,
    };
    this.logger.log(
      'Creating payment Management with params:',
      `${PaymentManagementService.name}#createPaymentManagement`,
      requestId,
      paymentObj,
    );
    await this.paymentManagementModel.create(paymentObj as any);
  }

  async setInRepaymentNonPrimeStatus(userId: string, requestId: string) {
    const screenTrackingDocument = await this.screenTrackingModel.findOne({
      user: userId,
    });
    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking for user id: ${userId}`;
      this.logger.error(
        errorMessage,
        `${PaymentManagementService.name}#setInRepaymentStatus`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const { offerData } = screenTrackingDocument;
    if (!offerData.downPayment || offerData.downPayment <= 0) {
      return;
    }

    await this.paymentManagementModel.findOneAndUpdate(
      {
        screenTracking: screenTrackingDocument._id,
      },
      { status: 'in-repayment non-prime' },
    );
  }

  async makePaymentFlexCard(payload: MakePaymentFlexDto, requestId) {
    try {
      const { amount, screenTrackingId } = payload;

      const screenData = await this.screenTrackingModel.findOne({
        _id: screenTrackingId,
      });
      if (!screenData) {
        throw new HttpException('Application not found', 404);
      }
      const loanPaymentResult = await this.loanPaymentProCardTokenModel.findOne(
        {
          user: screenData.user,
          isDefault: true,
          paymentType: 'CARD',
        },
      );
      if (!loanPaymentResult) {
        throw new HttpException('Card Details Not found', 404);
      }
      const response = await this.flexPayService.cardInstantTransaction(
        loanPaymentResult,
        screenData,
        amount,
        requestId,
      );
      if (!response.ok) {
        throw new HttpException('Payment Not Proceed', 500);
      }
      // const { transaction } = response.data;
      // if (!transaction || transaction.status === TransactionStatus.FAILED) {
      //   throw new HttpException('Transaction Failed due to Invalid Card', 404);
      // }
      return response;
    } catch (error) {
      this.logger.error('ERROR::', error);
      return error;
    }
  }

  async makePaymentFlexPayACH(payload: any, requestId) {
    try {
      const { amount, screenTrackingId, paymentMethodToken } = payload;

      const screenData = await this.screenTrackingModel
        .findOne({
          _id: screenTrackingId,
        })
        .populate('user')
        .lean();

      this.logger.log(
        JSON.stringify(screenData, null, 4),
        'makePaymentFlexPayACH#screenData',
        requestId,
      );

      if (!screenData) {
        throw new HttpException('Application not found', 404);
      }
      const userData: UserDocument | any = screenData.user;

      const loanPaymentResult = await this.loanPaymentProCardTokenModel
        .findOne({
          user: userData._id,
          paymentMethodToken,
          // isDefault: true,
          // paymentType: 'ACH',
        })
        .lean();

      if (!loanPaymentResult) {
        throw new HttpException('ACH Details Not found', 404);
      }

      this.logger.log(
        JSON.stringify(loanPaymentResult, null, 4),
        'makePaymentFlexPayACH#loanPaymentResult',
        requestId,
      );

      const achData = {
        user: userData,
        cardData: loanPaymentResult,
        screenTracking: screenData,
        amount: amount,
      };

      this.logger.log(
        JSON.stringify(achData, null, 4),
        'makePaymentFlexPayACH#achData',
        requestId,
      );

      const achResponse = await this.flexPayService.createAchTransaction(
        achData,
        requestId,
      );
      return achResponse;
    } catch (error) {
      this.logger.error('makePaymentFlexPayACH#error', error, requestId);
      return error;
    }
  }
}
