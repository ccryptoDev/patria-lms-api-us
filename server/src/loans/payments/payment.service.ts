import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';
import { nanoid } from 'nanoid';

import { LoggerService } from '../../logger/logger.service';
import { CountersDocument } from '../../counters/counters.schema';
import { CountersService } from '../../counters/counters.service';
import { User, UserDocument } from '../../user/user.schema';

import { PracticeManagementDocument } from '../practice-management/practice-management.schema';
import { LoanpaymentproService } from './loanpaymentpro/loanpaymentpro.service';
import {
  PaymentManagement,
  PaymentManagementDocument,
} from './payment-management/payment-management.schema';
import { Payment, PaymentDocument } from './payment.schema';
import { SubmitPaymentDto } from '../admin-dashboard/dtos/submit-payment.dto';
import { promisetoPay } from '../admin-dashboard/dtos/promisetoPay.dto';
import { LedgerService } from '../ledger/ledger.service';
import { AppService } from '../../app.service';
import {
  PaymentScheduleHistory,
  PaymentScheduleHistoryDocument,
} from './payment-schedule-history/payment-schedule-history.schema';
import { MakePaymentDialogDto } from '../admin-dashboard/dtos/makePaymentDialog.dto';
import { IPaymentScheduleItem } from './payment-management/payment-schedule-item.interface';
import { ILedger } from '../ledger/ledger.interface';
import crypto from 'crypto';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../user/screen-tracking/screen-tracking.schema';
import {
  LoanPaymentProCardSale,
  LoanPaymentProCardSaleDocument,
} from './loanpaymentpro/schemas/loanpaymentpro-card-sale.schema';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import {
  LoanPaymentProCardToken,
  LoanPaymentProCardTokenDocument,
} from './loanpaymentpro/schemas/loanpaymentpro-card-token.schema';
import { MandrillService } from '../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { ConfigService } from '@nestjs/config';
import { json } from 'body-parser';
import { IPaymentScheduleStatusItem } from './payment-management/payment-schedule-transactionstatus.interface';
import { ObjectId } from 'mongodb';
import { bool } from 'aws-sdk/clients/signer';
import { TransUnionsSchema } from '../underwriting/transunion/schemas/transunions.schema';
import { promiseToPayItem } from './payment-management/promise-to-pay-item.interface';
import { CarmelService } from './carmel/carmel.service';
import { PaymentManagementService } from './payment-management/payment-management.service';
@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(PaymentScheduleHistory.name)
    private readonly paymentScheduleHistoryModel: Model<PaymentScheduleHistoryDocument>,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly carmelService: CarmelService,
    private readonly countersService: CountersService,
    private readonly ledgerService: LedgerService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(LoanPaymentProCardSale.name)
    private readonly loanPaymentProCardSaleModel: Model<LoanPaymentProCardSaleDocument>,
    private readonly mailService: MandrillService,
    private readonly nunjucksService: NunjucksCompilerService,
    private readonly configService: ConfigService,
    @InjectModel(LoanPaymentProCardToken.name)
    private readonly loanPaymentProCardTokenModel: Model<LoanPaymentProCardTokenDocument>,
    private readonly logActivityService: LogActivityService,
    private readonly paymentManagementService: PaymentManagementService,
  ) {}

  async refundPaymentData(request: any, token: string) {
    this.logger.log(
      `Refund customer payment`,
      `${PaymentService.name}#refundPaymentData`,
      request.id,
    );

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const findUser = await this.userModel.findOne({
      customerUpdateToken: hashedToken,
      customerUpdateTokenExpires: { $gt: new Date() },
    });

    if (!findUser) {
      const errorMessage = 'Invalid user';
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#refundPaymentData`,
        request.id,
      );

      throw new UnauthorizedException();
    }

    const updateUserResponse = await this.userModel.updateOne(
      {
        customerUpdateToken: hashedToken,
        customerUpdateTokenExpires: { $gt: new Date() },
      },
      {
        customerUpdateToken: null,
        customerUpdateTokenExpires: null,
      },
    );

    if (updateUserResponse.nModified < 1) {
      const errorMessage = `Invalid token`;
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#refundPaymentData`,
        request.id,
        token,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, request.id),
      );
    }
    this.logger.log(
      `Refund Update Token`,
      `${PaymentService.name} #refundPaymentData`,
      request.id,
    );

    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: findUser._id,
    });
    // Updated Loan Status to Closed
    const paymentManagement = await this.paymentManagementModel.findOne({
      screenTracking: findscreenTracking._id,
    });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${PaymentService.name}#getPaymentSchedule`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Refund Payment management not found for user id ${findscreenTracking._id}`,
          request.id,
        ),
      );
    }

    const updatepaymentManagementModel =
      await this.paymentManagementModel.updateOne(
        { screenTracking: findscreenTracking._id },
        {
          status: 'closed',
          canRunAutomaticPayment: false,
        },
      );

    if (updatepaymentManagementModel.nModified < 1) {
      const errorMessage = `Invalid token`;
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#refundPaymentData`,
        request.id,
        token,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, request.id),
      );
    }
    // Updated Loan Status to Closed

    // Refund Process initiated

    const paidTransaction = await this.loanPaymentProCardSaleModel.find({
      user: findUser._id,
      status: 'Success',
    });

    paidTransaction.forEach(async (transaction) => {
      const refundStatus =
        await this.loanPaymentProService.v21PaymentsRefundCard(
          transaction.transactionId,
          transaction.paymentRequest.invoiceId,
          String(transaction.paymentRequest.amount),
          request.id,
        );
      if (refundStatus.ResponseCode == '29') {
        const refundUpdate = await this.paymentManagementModel.updateOne(
          {
            screenTracking: findscreenTracking._id,
            'paymentSchedule.paymentReference':
              transaction.paymentRequest.invoiceId,
          },
          {
            $set: {
              'paymentSchedule.$.isRefund': true,
              'paymentSchedule.$.refundAmount':
                transaction.paymentRequest.amount,
              'paymentSchedule.$.refundDate': new Date(),
            },
          },
        );

        if (refundUpdate.nModified < 1) {
          this.logger.log(
            'PSK Refund not updated',
            `${PaymentService.name}#getPaymentSchedule`,
            request.id,
          );
        } else {
          this.logger.log(
            'PSK Refund Updated',
            `${PaymentService.name}#getPaymentSchedule`,
            request.id,
          );
        }
      }
    });

    // Refund Process completed
    // // const { id, userName, email, role, practiceManagement } = request.user;
    // await this.logActivityService.createLogActivity(
    //   request,
    //   logActivityModuleNames.PAYMENT_SCHEDULE,
    //   `Email Confirmed and closed the loan`,
    //   {},
    //   undefined,
    //   undefined,
    // );

    await this.logActivityService.createLogActivityUpdateUser(
      request,
      logActivityModuleNames.PAYMENT_SCHEDULE,
      `${findUser.email} - ${findUser.userReference} Confirmed and closed the loan`,
      {
        userId: findUser._id,
      },
      findscreenTracking._id,
      findUser,
    );
  }

  async moveToCollection(email: string, status: string, loanPeriod: number) {
    try {
      this.logger.log(
        `moveToCollection`,
        `${PaymentService.name}#moveToCollection`,
        'request.id',
      );
      //for (const emailValue in email) {
      //if (index != 0) {
      const findUser = await this.userModel.findOne({
        email: email,
      });

      if (!findUser) {
        const errorMessage = 'Invalid user';
        this.logger.error(
          errorMessage,
          `${PaymentService.name}#moveToCollection`,
          'request.id',
        );

        throw new UnauthorizedException();
      }
      this.logger.log(
        'users found',
        `${findUser._id}#partialReturnData`,
        'request.id',
      );
      const findscreenTracking = await this.screenTrackingModel.findOne({
        user: findUser._id,
      });
      this.logger.log(
        'screentracking found',
        `${findscreenTracking._id}#partialReturnData`,
        'request.id',
      );
      const paymentManagement = await this.paymentManagementModel.findOne({
        user: findUser._id,
      });
      this.logger.log(
        'paymentManagement found',
        `${paymentManagement}#partialReturnData`,
        'request.id',
      );
      if (!paymentManagement) {
        this.logger.log(
          'Payment schedule not found',
          `${PaymentService.name}#partialReturnData`,
          'request.id',
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Payment management not found for user id ${findUser._id}`,
            'request.id',
          ),
        );
      }
      const today: Date = moment().startOf('day').toDate();
      // await this.paymentManagementModel.updateOne(
      //   { _id: paymentManagement._id },
      //   {
      //     collectionAssignStatus: collectionStatus,
      //     collectionsAccountStatus: collectionAccountStatus,
      //   },
      // );
      const paymentScheduleItems: IPaymentScheduleItem[] =
        paymentManagement.paymentSchedule.filter(
          (scheduleItem) =>
            moment(scheduleItem.date).startOf('day').isBefore(today) &&
            scheduleItem.status === 'opened',
        );

      // If there is no late payments in the schedule
      if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
        this.logger.log(
          'Payment management is not in collections',
          `${PaymentService.name}#movetocollections`,
          'request.id',
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            200,
            `Payment management not found in collections user id ${findscreenTracking._id}`,
            'request.id',
          ),
        );
      } else {
        const furthestLatePayment = paymentScheduleItems[0];
        this.logger.log(
          'Payment management move to collections paymentScheduleItems',
          `${PaymentService.name}#movetocollections`,
          `${JSON.stringify(furthestLatePayment)}`,
        );
        let collectionStatus: PaymentManagementDocument['collectionAssignStatus'] =
          await this.determineCollectionTier(
            moment(today).diff(furthestLatePayment.date, 'day'),
            loanPeriod,
          );
        this.logger.log(
          '\n\nPayment management move to collections paymentScheduleItems',
          `${PaymentService.name}#movetocollections`,
          `Status :- \n\n\n${JSON.stringify(
            collectionStatus,
          )}\n\n\n${JSON.stringify(loanPeriod)}`,
        );
        let collectionAccountStatus: PaymentManagementDocument['collectionsAccountStatus'] =
          '';
        if (collectionStatus != '') {
          collectionAccountStatus = 'WAITING_TO_COLLECT';
        }
        let updateStatus: PaymentManagementDocument['status'] =
          await this.determineDelinquentTier(
            moment(today).diff(furthestLatePayment.date, 'day'),
          );
        if (status.includes('Collections')) {
          updateStatus =
            findscreenTracking.offerData.downPayment == 0
              ? 'in-repayment prime'
              : 'in-repayment non-prime';
          collectionStatus = '';
          collectionAccountStatus = '';
          await this.paymentManagementModel.updateOne(
            { _id: paymentManagement._id },
            {
              status: updateStatus,
              collectionAssignStatus: collectionStatus,
              collectionsAccountStatus: collectionAccountStatus,
            },
          );
        } else if (collectionStatus != '') {
          await this.paymentManagementModel.updateOne(
            { _id: paymentManagement._id },
            {
              status: updateStatus,
              collectionAssignStatus: collectionStatus,
              collectionsAccountStatus: collectionAccountStatus,
            },
          );
        } else {
          throw new NotFoundException(
            this.appService.errorHandler(
              200,
              `Payment schedule is not delinquent ${findscreenTracking._id}`,
              'request.id',
            ),
          );
        }
      }
      //}

      //index = index + 1;
      //}
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentService.name}#updateCustomerDetails`,
        '',
        error,
      );
      throw error;
    }
  }

  async assignloan(email: [], admin: string) {
    try {
      this.logger.log(
        `assignloanPSK`,
        `\n\n\n${email}\n\n\n#assignloan`,
        'request.id',
      );
      let index = 0;
      for (const emailValue in email) {
        if (index != 0) {
          this.logger.log(
            `assignloanPSK`,
            `\n\n${email[index]}\n\n\n#assignloan`,
            'request.id',
          );
          const findUser = await this.userModel.findOne({
            email: email[index],
          });

          if (!findUser) {
            const errorMessage = 'Invalid user';
            this.logger.error(
              errorMessage,
              `${PaymentService.name}#assignloan`,
              'request.id',
            );

            throw new UnauthorizedException();
          }

          const findscreenTracking = await this.screenTrackingModel.findOne({
            user: findUser._id,
          });
          // Updated Loan Status to Assigned
          const paymentManagement = await this.paymentManagementModel.findOne({
            screenTracking: findscreenTracking._id,
          });
          if (!paymentManagement) {
            this.logger.log(
              'Payment schedule not found',
              `${PaymentService.name}#partialReturnData`,
              'request.id',
            );
            throw new NotFoundException(
              this.appService.errorHandler(
                404,
                `Payment management not found for user id ${findscreenTracking._id}`,
                'request.id',
              ),
            );
          } else {
            await this.paymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                collectionAssignedUser: admin,
                collectionAssignedEmail: email[index],
                collectionAssignStatus: 'Assigned',
              },
            );
          }
        }
        index = index + 1;
      }
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentService.name}#updateCustomerDetails`,
        '',
        error,
      );
      throw error;
    }
  }

  async assignloantome(email: [], admin: string) {
    try {
      this.logger.log(
        `assignloanPSK`,
        `\n\n\n${email}\n\n\n#assignloan`,
        'request.id',
      );
      let index = 0;
      for (const emailValue in email) {
        if (index != 0) {
          this.logger.log(
            `assignloanPSK`,
            `\n\n${email[index]}\n\n\n#assignloan`,
            'request.id',
          );
          const findUser = await this.userModel.findOne({
            email: email[index],
          });

          if (!findUser) {
            const errorMessage = 'Invalid user';
            this.logger.error(
              errorMessage,
              `${PaymentService.name}#assignloan`,
              'request.id',
            );

            throw new UnauthorizedException();
          }

          const findscreenTracking = await this.screenTrackingModel.findOne({
            user: findUser._id,
          });
          // Updated Loan Status to Assigned
          const paymentManagement = await this.paymentManagementModel.findOne({
            screenTracking: findscreenTracking._id,
          });
          if (!paymentManagement) {
            this.logger.log(
              'Payment schedule not found',
              `${PaymentService.name}#partialReturnData`,
              'request.id',
            );
            throw new NotFoundException(
              this.appService.errorHandler(
                404,
                `Payment management not found for user id ${findscreenTracking._id}`,
                'request.id',
              ),
            );
          } else {
            await this.paymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                collectionAssignedUser: admin,
                collectionAssignedEmail: email[index],
                collectionAssignStatus: 'Assigned',
              },
            );
          }
        }
        index = index + 1;
      }
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentService.name}#updateCustomerDetails`,
        '',
        error,
      );
      throw error;
    }
  }

  async determineCollectionTier(
    days: number,
    dPeriod: number,
  ): Promise<PaymentManagementDocument['collectionAssignStatus']> {
    if (days >= dPeriod) {
      return 'Unassigned';
    } else {
      return '';
    }
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

  async partialReturnData(request: any, email: string, amount: number) {
    this.logger.log(
      `partialReturnData customer payment`,
      `${PaymentService.name}#partialReturnData`,
      request.id,
    );

    const findUser = await this.userModel.findOne({
      email: email,
    });

    if (!findUser) {
      const errorMessage = 'Invalid user';
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#partialReturnData`,
        request.id,
      );

      throw new UnauthorizedException();
    }

    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: findUser._id,
    });
    // Updated Loan Status to Closed
    const paymentManagement = await this.paymentManagementModel.findOne({
      screenTracking: findscreenTracking._id,
    });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${PaymentService.name}#partialReturnData`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Refund Payment management not found for user id ${findscreenTracking._id}`,
          request.id,
        ),
      );
    }

    const user = paymentManagement.user as UserDocument;
    let cardToken = await this.loanPaymentProCardTokenModel.findOne({
      user,
      isDefault: true,
    });
    // console.log('PSK partialReturnData');
    // console.log(JSON.stringify(cardToken));
    if (!cardToken) {
      cardToken = await this.loanPaymentProCardTokenModel.findOne({
        user,
      });
      if (!cardToken) {
        this.logger.error(
          `Payment method token for user id ${user._id} not found`,
          `${PaymentService.name}#makeAutomaticPayment`,
        );
      }
    }

    // console.log('PSK partialReturnData');
    // console.log(JSON.stringify(cardToken));
    const refundStatus = await this.loanPaymentProService.v21PaymentsReturnRun(
      findUser._id,
      cardToken.paymentMethodToken,
      amount,
      request.id,
    );
    //console.log('PSK Return status', refundStatus);
    if (refundStatus == 200) {
      // const refundUpdate = await this.paymentManagementModel.updateOne(
      //   {
      //     screenTracking: findscreenTracking._id,
      //     'paymentSchedule.paymentReference':
      //       transaction.paymentRequest.invoiceId,
      //   },
      //   {
      //     $set: {
      //       'paymentSchedule.$.isRefund': true,
      //       'paymentSchedule.$.refundAmount':
      //         transaction.paymentRequest.amount,
      //       'paymentSchedule.$.refundDate': new Date(),
      //     },
      //   },
      // );
      // if (refundUpdate.nModified < 1) {
      //   this.logger.log(
      //     'PSK Refund not updated',
      //     `${PaymentService.name}#getPaymentSchedule`,
      //     request.id,
      //   );
      // } else {
      //   this.logger.log(
      //     'PSK Refund Updated',
      //     `${PaymentService.name}#getPaymentSchedule`,
      //     request.id,
      //   );
      // }
    }

    // const updatepaymentManagementModel = await this.paymentManagementModel.updateOne(
    //   { screenTracking: findscreenTracking._id },
    //   {
    //     payOffAmount: paymentManagement.payOffAmount - amount,
    //   },
    // );
    // console.log('PSK Partial Return');
    // console.log(updatepaymentManagementModel.payOffAmount);
  }

  async paymentSuccess(
    user: User,
    sTracking: ScreenTracking,
    paymentDoc: PaymentDocument,
    location: string,
  ) {
    try {
      //console.log('PSK Payment Success');
      const address = `${user.street} ${user.state} ${user.city}`;
      const baseUrl = this.configService.get<string>('VUE_APP_URL');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-paymentsuccess.html',
        {
          userName: `${user.firstName} ${user.lastName}`,
          amount: paymentDoc.amount,
          location: location || address,
          link: `${baseUrl}/login`,
        },
      );
      const subject = 'Thank You For Your Payment!';
      const from = 'no-reply@patrialending.com';
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, '');

      this.logger.log(
        'Response status 204',
        `${PaymentService.name}#updateCustomerDetails`,
        '',
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentService.name}#updateCustomerDetails`,
        '',
        error,
      );
      throw error;
    }
  }
  async paymentFailure(user: User, amount: number, message: string) {
    try {
      //console.log('PSK Payment Success', amount);
      const baseUrl = this.configService.get<string>('VUE_APP_URL');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-paymentfailure.html',
        {
          userName: `${user.firstName} ${user.lastName}`,
          amount: amount,
          link: `${baseUrl}/login`,
          message: message,
        },
      );
      const subject = 'Patria Lending Pay - Payment Not Processed';
      const from = 'no-reply@patrialending.com';
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, '');

      this.logger.log(
        'Response status 204',
        `${PaymentService.name}#paymentFailure`,
        '',
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentService.name}#paymentFailure`,
        '',
        error,
      );
      throw error;
    }
  }

  async makePayment(
    // PSK Updated
    paymentManagement: PaymentManagementDocument,
    paymentVia: string,
    amount: number,
    requestId?: string,
  ) {
    const paymentNextValue: CountersDocument =
      await this.countersService.getNextSequenceValue('payment', requestId);
    const practiceManagement =
      paymentManagement.practiceManagement as PracticeManagementDocument;
    const user = paymentManagement.user as UserDocument;
    const findUser = await this.userModel.findOne({
      _id: user._id,
    });
    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: user._id,
    });

    //console.log('PSK Payment Success', JSON.stringify(findUser));
    //console.log('PSK Payment Success', JSON.stringify(findscreenTracking));
    const paymentObj = {
      amount,
      paymentReference: `PMT_${paymentNextValue.sequenceValue}`,
      paymentManagement: paymentManagement?._id,
      practiceManagement: practiceManagement?._id,
      status: 'pending',
      user: user._id,
      type: 'ACH',
      vendor: 'FlexPay',
    };
    const payment: PaymentDocument = new this.paymentModel(paymentObj);
    await payment.save();

    const paymentData = await this.loanPaymentProCardTokenModel.findById({
      _id: paymentVia,
    });
    const { paymentMethodToken, paymentType } = paymentData;
    let cardSale: any;
    try {
      if (paymentType === 'ACH') {
        if (!paymentMethodToken) {
          throw new HttpException('Payment Token Not Found', 404);
        }

        cardSale = await this.paymentManagementService.makePaymentFlexPayACH(
          {
            amount,
            screenTrackingId: paymentManagement.screenTracking,
            paymentMethodToken,
            paymentRef: payment.paymentReference,
          },
          requestId,
        );

        if (!cardSale.ok) {
          throw cardSale.error || 'Error processing payment';
        }
      } else if (paymentType === 'CARD') {
        const payload = {
          amount,
          screenTrackingId: findscreenTracking._id,
          paymentVia,
          paymentData,
        };
        const cardResponse =
          await this.paymentManagementService.chargePaymentFlexPayCard(
            payload,
            requestId,
          );
        if (!cardResponse.ok) {
          throw new HttpException(cardResponse.error, 500);
        }
      }

      payment.transactionMessage =
        cardSale?.data?.transaction?.itemStatusDescription;
      payment.transId = String(cardSale?.data?.transaction?.achItemId);
      payment.status = 'paid';
      await payment.save();
      //this.welcomeEmail(findUser, findscreenTracking, paymentManagement);
      this.paymentSuccess(
        findUser,
        findscreenTracking,
        payment,
        practiceManagement?.location,
      );
      //Payment transaction success email
    } catch (error) {
      this.logger.log(
        'Payment error: ',
        `${PaymentService.name}#makePayment`,
        requestId,
        error,
      );
      this.paymentFailure(findUser, amount, error.message);
      payment.status = 'declined';
      throw error;
    }

    await payment.save();
    return payment;
  }

  async makeDownPayment(
    user: string,
    screenTracking: string,
    amount: number,
    paymentMethodToken: string,
    requestId: string,
  ) {
    this.logger.log(
      'Making down payment with params:',
      `${PaymentService.name}#makeDownPayment`,
      requestId,
      { user, screenTracking, amount, paymentMethodToken },
    );
    const paymentManagement: PaymentManagementDocument =
      await this.paymentManagementModel.findOne({
        user,
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found.',
        `${PaymentService.name}#makeDownPayment`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user ${user}`,
          requestId,
        ),
      );
    }

    if (paymentManagement.paymentSchedule[0].status === 'paid') {
      this.logger.error(
        'Down payment already made',
        `${PaymentService.name}#makeDownPayment`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(403, 'Payment already made', requestId),
      );
    }

    await this.submitPayment(
      { paymentMethodToken, amount, paymentDate: new Date(), screenTracking },
      requestId,
    );
  }
  num = 0;
  previewPayment(
    paymentManagement: PaymentManagementDocument,
    paymentAmount: number,
    paymentDate: Date,
    requestId: string,
  ) {
    // const paymentDate: Date = moment().startOf('day').toDate();
    const {
      paymentSchedule,
      currentPaymentAmount,
      promoPaymentAmount,
      promoStatus,
    } = paymentManagement;
    const isPromoAmount =
      currentPaymentAmount >= promoPaymentAmount && promoStatus === 'available'
        ? true
        : false;

    const ledger: ILedger = this.ledgerService.getPaymentLedger(
      paymentManagement,
      paymentDate,
      requestId,
    );

    const today = moment().startOf('day').toDate();
    this.num = 0;
    paymentSchedule.forEach((scheduleItem) => {
      const isPastDue =
        moment(scheduleItem.date).isSameOrAfter(
          moment(today).startOf('day'),
          'day',
        ) && scheduleItem.status === 'opened';
      const isPastDue1 =
        moment(ledger.ledgerDate).isAfter(
          moment(scheduleItem.date).startOf('day'),
          'day',
        ) && scheduleItem.status === 'opened';

      const isPastDue2 =
        moment(scheduleItem.date).isBefore(
          moment(today).startOf('day'),
          'day',
        ) && scheduleItem.status === 'opened';

      if (!isPastDue && scheduleItem.status != 'failed' && isPastDue2) {
        this.num = this.num + 1;
      }
      if (isPastDue1 && isPastDue) {
        if (this.num == 0) {
          ledger.principalBalance =
            ledger.principalBalance - scheduleItem.principal;
          ledger.accruedInterestBalance = 0;
          ledger.cycleAccruedInterest = 0;
        }
      }
    });

    const preview = {
      payment: paymentAmount,
      daysPastDue: 0,
      accruedInterest: ledger.cycleAccruedInterest,
      accruedBalance: {
        fees: 0,
        interest: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      paymentBalance: {
        fees: 0,
        interest: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      unpaidBalance: {
        fees: 0,
        interest: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      amendedBalance: {
        amendedInterest: 0,
        amendedPrincipal: 0,
        unpaidInterest: 0,
        principal: 0,
      },
      paymentSchedule: undefined as IPaymentScheduleItem[],
      nextPaymentSchedule: moment(paymentManagement.nextPaymentSchedule)
        .startOf('day')
        .toDate(),
      newScheduleItemIndex: 0,
      newScheduleItemTransactionId: '',
      scheduleIndex: '',
      payoff: 0,
    };

    let nextScheduleItem = paymentSchedule.find(
      (scheduleItem) => scheduleItem.status === 'opened',
    );

    const isPayoff = paymentAmount >= ledger.payoff;
    if (isPayoff) {
      preview.accruedBalance.fees = ledger.accruedFeesBalance;
      preview.accruedBalance.interest = isPromoAmount
        ? 0
        : ledger.accruedInterestBalance;
      preview.accruedBalance.principal = ledger.principalBalance;
      preview.accruedBalance.unpaidInterest = ledger.unpaidInterestBalance;
      preview.accruedInterest = ledger.cycleAccruedInterest;

      preview.daysPastDue = ledger.daysPastDue;

      preview.paymentBalance.fees = ledger.accruedFeesBalance;
      preview.paymentBalance.interest = isPromoAmount
        ? 0
        : ledger.accruedInterestBalance;
      preview.paymentBalance.principal = ledger.principalBalance;
      preview.paymentBalance.unpaidInterest = ledger.unpaidInterestBalance;

      preview.payoff = 0;

      preview.unpaidBalance.fees = 0;
      preview.unpaidBalance.interest = 0;
      preview.unpaidBalance.principal = 0;
      preview.unpaidBalance.unpaidInterest = 0;
    } else {
      preview.accruedBalance.fees = ledger.accruedFeesBalance;
      preview.accruedBalance.interest = isPromoAmount
        ? 0
        : ledger.cycleAccruedInterest;
      preview.accruedBalance.principal = ledger.principalBalance; //- ledger.paidPrincipalBalance;
      preview.accruedBalance.unpaidInterest = ledger.unpaidInterestBalance;

      preview.accruedInterest = isPromoAmount ? 0 : ledger.cycleAccruedInterest;
      preview.daysPastDue = ledger.daysPastDue;

      // apply payment to balances
      let payment: number = paymentAmount;
      const paidFees = Math.min(ledger.accruedFeesBalance, payment);
      payment -= paidFees;
      const unpaidFees = this.toFixed(ledger.accruedFeesBalance - paidFees, 2);
      const pastDueInterest = ledger.unpaidInterestBalance;
      const paidPastDueInterest = Math.min(pastDueInterest, payment);
      if (this.num == 0) {
        //paidPastDueInterest = 0; //Math.min(pastDueInterest, payment);
      }
      payment -= paidPastDueInterest;
      const unpaidPastDueInterest = this.toFixed(
        ledger.unpaidInterestBalance - paidPastDueInterest,
        2,
      );
      const interestBalance = ledger.cycleAccruedInterest;
      const paidInterest = isPromoAmount
        ? 0
        : Math.min(interestBalance, payment);
      payment -= paidInterest;
      const unpaidInterestBalance = this.toFixed(
        interestBalance - paidInterest,
        2,
      );
      const paidPrincipal = this.toFixed(payment, 2);
      const unpaidPrincipal = this.toFixed(
        ledger.principalBalance - paidPrincipal,
        2,
      );

      preview.paymentBalance.fees = paidFees;
      preview.paymentBalance.interest = paidInterest;
      preview.paymentBalance.principal = paidPrincipal;
      preview.paymentBalance.unpaidInterest = paidPastDueInterest;

      preview.payoff = unpaidPrincipal;

      preview.unpaidBalance.fees = unpaidFees;
      preview.unpaidBalance.interest = isPromoAmount
        ? 0
        : unpaidInterestBalance;
      preview.unpaidBalance.principal = unpaidPrincipal;
      preview.unpaidBalance.unpaidInterest = unpaidPastDueInterest;
    }
    const {
      newScheduleItemTransactionId,
      newScheduleItemIndex,
      newPaymentManagement,
    } = this.previewAmortizedSchedule(
      paymentAmount,
      paymentDate,
      nextScheduleItem,
      paymentManagement,
      ledger,
      preview.paymentBalance,
      requestId,
    );
    preview.newScheduleItemIndex = newScheduleItemIndex;
    preview.newScheduleItemTransactionId = newScheduleItemTransactionId;
    paymentManagement = newPaymentManagement;
    preview.paymentSchedule = paymentManagement.paymentSchedule;
    nextScheduleItem = paymentManagement.paymentSchedule.find(
      (scheduleItem) => scheduleItem.status === 'opened',
    );
    preview.nextPaymentSchedule = nextScheduleItem.date;

    let index = 0;
    paymentManagement.paymentSchedule.forEach(async (scheduleItem) => {
      if (
        scheduleItem.status === 'opened' &&
        index === 0 &&
        scheduleItem.payment == 0
      ) {
        index = 1;
        preview.scheduleIndex = scheduleItem.transactionId;
      }
    });

    const response = {
      paymentAmount,
      ledger,
      preview,
      newPaymentScheduleItem:
        paymentManagement.paymentSchedule[newScheduleItemIndex],
    };

    return response;
  }

  async makePaymentRenderDialog(
    makePaymentDto: MakePaymentDialogDto,
    requestId: string,
  ) {
    const { screenTracking } = makePaymentDto;
    let { amount, paymentDate } = makePaymentDto;
    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${screenTracking}`,
          requestId,
        ),
      );
    }
    const today = moment().startOf('day').toDate();
    const dateBoundary = moment(today).add(2, 'months').toDate();
    const { currentPaymentAmount, payOffAmount } = paymentManagement;
    if (moment(paymentDate).startOf('day').isBefore(today)) {
      paymentDate = today;
    } else if (moment(paymentDate).startOf('day').isAfter(dateBoundary)) {
      paymentDate = today;
    }

    if (!amount || amount <= 0) {
      amount =
        currentPaymentAmount > payOffAmount
          ? payOffAmount
          : currentPaymentAmount;
    } else if (amount >= payOffAmount) {
      amount = payOffAmount;
    }

    // regular payment
    const previewResult = this.previewPayment(
      paymentManagement,
      amount,
      paymentDate,
      requestId,
    );
    const { ledger } = previewResult;

    const response = {
      regularPayment:
        currentPaymentAmount > payOffAmount
          ? payOffAmount
          : currentPaymentAmount,
      payoff: ledger.payoff,
      previewResult,
    };

    // this.logger.log(
    //   'Adjusting schedule with params:',
    //   `${LedgerService.name}#adjustSchedule`,
    //   requestId,
    //   { response },
    // );

    return response;
  }

  async submitPayment(submitPaymentDto: SubmitPaymentDto, requestId: string) {
    const { paymentMethodToken, screenTracking, paymentVia } = submitPaymentDto;
    let { amount, paymentDate } = submitPaymentDto;
    const today = moment().startOf('day').toDate();
    const dateBoundary = moment(today).add(2, 'months').toDate();
    if (
      moment(paymentDate).startOf('day').isBefore(moment(today).startOf('day'))
    ) {
      paymentDate = today;
    }
    if (
      moment(paymentDate)
        .startOf('day')
        .isAfter(moment(dateBoundary).startOf('day'))
    ) {
      paymentDate = today;
    }

    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${screenTracking}`,
          requestId,
        ),
      );
    }

    if (!amount || amount <= 0) {
      amount = paymentManagement.currentPaymentAmount;
    } else if (amount >= paymentManagement.payOffAmount) {
      amount = paymentManagement.payOffAmount;
    }

    const { preview } = this.previewPayment(
      paymentManagement,
      amount,
      paymentDate,
      requestId,
    );
    await this.paymentScheduleHistoryModel.updateOne(
      { _id: String(paymentManagement._id) },
      {
        paymentSchedule: paymentManagement.paymentSchedule,
        nextPaymentSchedule: preview.nextPaymentSchedule,
      },
    );

    const updatedPaymentManagement = {
      paymentSchedule: preview.paymentSchedule,
      payOffAmount: paymentManagement.payOffAmount,
      status: paymentManagement.status,
      promoStatus: paymentManagement.promoStatus,
    };
    let paymentDetails: PaymentDocument | undefined;
    if (moment(paymentDate).startOf('day').isSame(today, 'day')) {
      const payment: PaymentDocument = await this.makePayment(
        paymentManagement,
        paymentVia,
        amount,
        requestId,
      );
      preview.paymentSchedule[preview.newScheduleItemIndex].paymentReference =
        payment.paymentReference;
      preview.paymentSchedule[preview.newScheduleItemIndex].paymentId =
        payment._id;
      preview.paymentSchedule[preview.newScheduleItemIndex].status =
        payment.status;
      updatedPaymentManagement.payOffAmount = preview.payoff;

      if (preview.unpaidBalance.principal <= 0) {
        updatedPaymentManagement.status = 'paid';
        updatedPaymentManagement.promoStatus = 'unavailable';
      }

      paymentDetails = payment;
    }

    await this.paymentManagementModel.updateOne(
      { _id: paymentManagement._id },
      updatedPaymentManagement,
    );

    if (paymentDetails) {
      return paymentDetails;
    }
  }

  async promisetoPay(promisetoPay: promisetoPay, requestId: string) {
    const { paymentId, promiseDescription } = promisetoPay;
    const {
      promisedPayAmount,
      promiseScheduleDate,
      promiseScheduleTime,
      isRemovingSchedule,
      promiseScheduleStatus,
    } = promisetoPay;
    const promiseToPayMoment = moment(
      `${promiseScheduleDate} ${promiseScheduleTime}`,
      'MM-DD-YYYY h:mm A',
    );
    this.logger.log(
      `Processing promisetoPay payment for payment management id ${paymentId}\n
      ${promisedPayAmount}\n${promiseScheduleDate}\n${promiseScheduleTime}\n${isRemovingSchedule}\n`,
      `${PaymentService.name}#promisetoPay`,
    );

    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        _id: paymentId,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${paymentId}`,
          requestId,
        ),
      );
    }
    const promiseArray: promiseToPayItem[] = paymentManagement.promiseToPay;
    const existingPromiseIndex = promiseArray.findIndex(
      (promise) =>
        moment(promise.contactScheduleReminderDate).isSame(
          moment(promiseToPayMoment),
        ) && promise.contactScheduleReminderStatus == 'Pending',
    );
    if (existingPromiseIndex < 0) {
      const promiseObject: promiseToPayItem = {
        contactScheduleReminderDate: promiseToPayMoment.toDate(),
        contactScheduleReminderStatus: 'Pending',
        contactScheduleReminderAmount: promisedPayAmount,
        promiseDescription: promiseDescription,
      };
      promiseArray.push(promiseObject);
    } else {
      promiseArray[existingPromiseIndex].contactScheduleReminderAmount =
        Number(
          promiseArray[existingPromiseIndex].contactScheduleReminderAmount,
        ) + Number(promisedPayAmount);
      promiseArray[existingPromiseIndex].promiseDescription =
        promiseArray[existingPromiseIndex].promiseDescription +
        '\n' +
        promiseDescription;
    }

    this.logger.log(
      `Processing promisetoPay payment for payment management id \n\n\n${JSON.stringify(
        promiseArray,
      )}\n\n\n${paymentId}`,
      `${PaymentService.name}#promisetoPay`,
    );

    try {
      const paymentUpdate = await this.paymentManagementModel.updateOne(
        { _id: paymentId },
        { promiseToPay: promiseArray },
      );
      return paymentUpdate;
    } catch (error) {
      this.logger.error(
        `Could not process amend payment for payment management id }`,
        `${PaymentService.name}#makeAmendPayment`,
        undefined,
        error,
      );
    }
  }

  async changeStatusPromisetopay(
    paymentManagementId: string,
    promiseDate: string,
    status: string,
    requestId: string,
  ) {
    try {
      const paymentManagement: PaymentManagementDocument | null =
        await this.paymentManagementModel.findOne({
          _id: paymentManagementId,
        });
      if (!paymentManagement) {
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Payment management not found for screen tracking id ${status}`,
            requestId,
          ),
        );
      }

      const promiseArray = paymentManagement.promiseToPay;
      const promiseIndex = promiseArray.findIndex(
        (promise) =>
          moment(promise.contactScheduleReminderDate).isSame(
            moment(promiseDate),
          ) && promise.contactScheduleReminderStatus == 'Pending',
      );

      if (promiseIndex < 0) {
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Promise to Pay item not found.`,
            requestId,
          ),
        );
      }

      promiseArray[promiseIndex].contactScheduleReminderStatus = status;
      const paymentUpdate = await this.paymentManagementModel.updateOne(
        { _id: paymentManagementId },
        { promiseToPay: promiseArray },
      );
      return paymentUpdate;
    } catch (error) {
      this.logger.error(
        `Could not upate promise pay item`,
        `${PaymentService.name}#changeStatusPromisetopay`,
        undefined,
        error,
      );
    }
  }

  async updatePromisetopay(
    paymentManagementId: string,
    promiseDate: string,
    amount: number,
    newPromiseDate: string,
    requestId: string,
  ) {
    try {
      const paymentManagement: PaymentManagementDocument | null =
        await this.paymentManagementModel.findOne({
          _id: paymentManagementId,
        });
      if (!paymentManagement) {
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Payment management not found for screen tracking id ${status}`,
            requestId,
          ),
        );
      }

      const promiseArray = paymentManagement.promiseToPay;
      const promiseIndex = promiseArray.findIndex((promise) =>
        moment(promise.contactScheduleReminderDate).isSame(moment(promiseDate)),
      );

      if (promiseIndex < 0) {
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Promise to Pay item not found.`,
            requestId,
          ),
        );
      }

      promiseArray[promiseIndex].contactScheduleReminderAmount = amount;
      promiseArray[promiseIndex].contactScheduleReminderDate =
        moment(newPromiseDate).toDate();
      const paymentUpdate = await this.paymentManagementModel.updateOne(
        { _id: paymentManagementId },
        { promiseToPay: promiseArray },
      );
      return paymentUpdate;
    } catch (error) {
      this.logger.error(
        `Could not upate promise pay item`,
        `${PaymentService.name}#updatePromisetopay`,
        undefined,
        error,
      );
    }
  }

  async amendPayment(submitPaymentDto: SubmitPaymentDto, requestId: string) {
    const { paymentMethodToken, screenTracking } = submitPaymentDto;
    let { amount, paymentDate } = submitPaymentDto;
    const today = moment().startOf('day').toDate();
    const dateBoundary = moment(today).add(2, 'months').toDate();
    if (
      moment(paymentDate).startOf('day').isBefore(moment(today).startOf('day'))
    ) {
      paymentDate = today;
    }

    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${screenTracking}`,
          requestId,
        ),
      );
    }

    if (!amount || amount <= 0) {
      amount = paymentManagement.currentPaymentAmount;
    } else if (amount >= paymentManagement.payOffAmount) {
      amount = paymentManagement.payOffAmount;
    }
    let paymentManagementId = '';
    const scheduleItemIndex = 0;
    let paymentSchedule: IPaymentScheduleItem[];
    let payment: PaymentDocument;
    try {
      // get default card token
      paymentManagementId = paymentManagement._id;
      const user = paymentManagement.user as UserDocument;
      let cardToken = await this.loanPaymentProCardTokenModel.findOne({
        user,
        isDefault: true,
      });

      if (!cardToken) {
        cardToken = await this.loanPaymentProCardTokenModel.findOne({
          user,
        });
        if (!cardToken) {
          this.logger.error(
            `Payment method token for user id ${user._id} not found`,
            `${PaymentService.name}#makeAutomaticPayment`,
          );
        }
      }

      // find schedule items
      const paymentScheduleItems: IPaymentScheduleItem[] =
        paymentManagement.paymentSchedule;
      if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
        return;
      }

      this.logger.log(
        `Processing AmendPayment payment for payment management id ${paymentManagementId}\n\n${screenTracking}`,
        `${PaymentService.name}#makeAutomaticPayment`,
      );
      //paymentSchedule = paymentManagement.paymentSchedule;
      let index = 0;
      paymentManagement.paymentSchedule.forEach(async (scheduleItem) => {
        const today = moment().startOf('day').toDate();
        if (scheduleItem.status === 'opened' && index === 0) {
          index = 1;
          this.logger.log(
            `make AmendPayment PSKV for payment management id ${scheduleItem.transactionId} processed successfully ${paymentManagement._id}.\n\n\n ${scheduleItem.amount}\n\n\n${submitPaymentDto.amount}`,
            `${scheduleItem.transactionId}#makeAmendPayment`,
          );

          //make payment
          const paymentAmount = submitPaymentDto.amount;
          payment = await this.makePayment(
            paymentManagement,
            cardToken.paymentMethodToken,
            paymentAmount,
          );
          scheduleItem.payment = paymentAmount;
          scheduleItem.amount = paymentAmount;
          scheduleItem.paidInterest = scheduleItem.interest;
          scheduleItem.paidPrincipal = scheduleItem.principal;
          scheduleItem.status = 'paid';
          scheduleItem.isAmended = true;
          scheduleItem.paymentType = 'manual';
          scheduleItem.paymentReference = `${payment.paymentReference} Amended`;
          scheduleItem.paymentDate = today;
          scheduleItem.transactionMessage = `${payment.transactionMessage} Payment Amended`;
          scheduleItem.transId = payment.transId;

          const updatedPaymentManagement = {
            paymentSchedule: paymentManagement.paymentSchedule,
            status:
              paymentManagement.payOffAmount <= 0
                ? 'paid'
                : paymentManagement.status,
            nextPaymentSchedule: today,
          };

          // find next payment date
          const nextPaymentScheduleItem: IPaymentScheduleItem =
            paymentManagement.paymentSchedule.find(
              (scheduleItem) => scheduleItem.status === 'opened',
            );
          if (nextPaymentScheduleItem) {
            updatedPaymentManagement.nextPaymentSchedule =
              nextPaymentScheduleItem.date;
          }

          await this.paymentManagementModel.updateOne(
            { _id: paymentManagement._id },
            updatedPaymentManagement,
          );
          this.logger.log(
            `make AmendPayment for payment management id ${paymentManagementId} processed successfully.`,
            `${PaymentService.name}#makeAmendPayment`,
          );
        }
      });
      // for (const paymentScheduleItem of paymentScheduleItems) {
      //   scheduleItemIndex = paymentSchedule.findIndex(
      //     (scheduleItem) =>
      //       scheduleItem.transactionId === paymentScheduleItem.transactionId,
      //   );

      // }
    } catch (error) {
      this.logger.error(
        `Could not process amend payment for payment management id ${paymentManagementId}`,
        `${PaymentService.name}#makeAmendPayment`,
        undefined,
        error,
      );

      // add transaction status to payment schedule

      const transactionStatus: IPaymentScheduleStatusItem = {
        amount: paymentManagement.currentPaymentAmount,
        date: paymentManagement.paymentSchedule[scheduleItemIndex].date,
        transactionMessage: error.message,
        transId: error.transactionId,
      };
      const newPaymentTransactionstatus: IPaymentScheduleStatusItem[] = [];
      newPaymentTransactionstatus.push(transactionStatus);

      const updatedPaymentManagement = {
        paymentSchedule: paymentManagement.paymentSchedule,
      };
      // updatedPaymentManagement.paymentSchedule[
      //   scheduleItemIndex
      // ].transactionStatus = newPaymentTransactionstatus;

      await this.paymentManagementModel.updateOne(
        { _id: paymentManagement._id },
        updatedPaymentManagement,
      );
      // add failed schedule item to payment schedule

      const failedScheduleItem: IPaymentScheduleItem = {
        ...paymentSchedule[scheduleItemIndex],
        status: 'failed',
        transactionMessage: error.message,
        transId: error.transactionId,
        date: today,
      };
      const newPaymentSchedule: IPaymentScheduleItem[] = [];
      paymentSchedule.forEach((scheduleItem) => {
        if (moment(scheduleItem.date).isBefore(today, 'day')) {
          newPaymentSchedule.push(scheduleItem);
        }
      });
      newPaymentSchedule.push(failedScheduleItem);

      await this.paymentManagementModel.findByIdAndUpdate(paymentManagementId, {
        paymentSchedule: newPaymentSchedule,
      });
    }

    if (payment) {
      return payment;
    }
    this.logger.log('Amend Payment', `${PaymentService.name}#makeAmendPayment`);
  }

  addDays(days: number, dates: Date): Date {
    const futureDate = dates;
    futureDate.setDate(futureDate.getDate() + days);
    return futureDate;
  }

  async amendPayment1(submitPaymentDto: SubmitPaymentDto, requestId: string) {
    const { paymentMethodToken, screenTracking } = submitPaymentDto;
    let { amount, paymentDate } = submitPaymentDto;
    const today = moment().startOf('day').toDate();
    const dateBoundary = moment(today).add(2, 'months').toDate();
    if (
      moment(paymentDate).startOf('day').isBefore(moment(today).startOf('day'))
    ) {
      paymentDate = today;
    }
    if (
      moment(paymentDate)
        .startOf('day')
        .isAfter(moment(dateBoundary).startOf('day'))
    ) {
      paymentDate = today;
    }

    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for screen tracking id ${screenTracking}`,
          requestId,
        ),
      );
    }

    if (!amount || amount <= 0) {
      amount = paymentManagement.currentPaymentAmount;
    } else if (amount >= paymentManagement.payOffAmount) {
      amount = paymentManagement.payOffAmount;
    }

    const { preview } = this.previewPayment(
      paymentManagement,
      amount,
      paymentDate,
      requestId,
    );

    const payment: PaymentDocument = await this.makePayment(
      paymentManagement,
      paymentMethodToken,
      amount,
      requestId,
    );

    let index = 0;
    let ScheduleItemIndex = 0;
    paymentManagement.paymentSchedule.forEach((scheduleItem) => {
      const today = moment().startOf('day').toDate();
      if (scheduleItem.status === 'opened' && index === 0) {
        index = 1;
        scheduleItem.isAmended = true;
        scheduleItem.status = payment.status;
        scheduleItem.paymentDate = today;
        scheduleItem.paymentReference = 'Amended ' + payment.paymentReference;
        scheduleItem.payment = scheduleItem.amount;
        scheduleItem.paidInterest = scheduleItem.interest;
        scheduleItem.paidPrincipal = scheduleItem.principal;
        paymentManagement.payOffAmount =
          paymentManagement.payOffAmount - scheduleItem.principal;
        scheduleItem.paymentId = payment._id;
        scheduleItem.payment = scheduleItem.amount;
        scheduleItem.paymentDate = today;
        scheduleItem.transactionMessage = 'Payment is amended';
        scheduleItem.transId = '';
      }
      ScheduleItemIndex = ScheduleItemIndex + 1;
    });

    await this.paymentScheduleHistoryModel.updateOne(
      { _id: String(paymentManagement._id) },
      {
        paymentSchedule: paymentManagement.paymentSchedule,
        nextPaymentSchedule: preview.nextPaymentSchedule,
      },
    );

    const paymentDetails: PaymentDocument = payment;

    await this.paymentManagementModel.updateOne(
      { _id: paymentManagement._id },
      paymentManagement,
    );

    if (paymentDetails) {
      return paymentDetails;
    }
  }

  previewAmortizedSchedule(
    paymentAmount: number,
    paymentDate: Date,
    paymentScheduleItem: IPaymentScheduleItem,
    paymentManagement: PaymentManagementDocument,
    ledger: ILedger,
    paidBalances: {
      fees: number;
      unpaidInterest: number;
      interest: number;
      principal: number;
    },
    requestId: string,
  ): {
    newPaymentManagement: PaymentManagementDocument;
    newScheduleItemIndex: number;
    newScheduleItemTransactionId: string;
  } {
    // this.logger.log(
    //   'Adjusting schedule with params:previewAmortizedSchedule',
    //   `${LedgerService.name}#adjustSchedule`,
    //   requestId,
    //   { paymentAmount, paymentScheduleItem, paymentManagement, ledger },
    // );
    const {
      paymentSchedule,
      currentPaymentAmount,
      promoPaymentAmount,
      promoStatus,
    } = paymentManagement;
    const newPaymentSchedule: IPaymentScheduleItem[] = [];
    const isPromoAmount =
      currentPaymentAmount >= promoPaymentAmount && promoStatus === 'available'
        ? true
        : false;
    if (this.num == 0) {
      ledger.unpaidInterestBalance = 0;
    }

    const newScheduleItem: IPaymentScheduleItem = {
      amount: paymentAmount,
      date: paymentDate,
      endPrincipal: this.toFixed(
        ledger.principalBalance - paidBalances.principal,
        2,
      ),
      fees: ledger.accruedFeesBalance,
      nsfFee: ledger.accruedFeesBalance,
      interest: isPromoAmount ? 0 : ledger.cycleAccruedInterest,
      paidFees: paidBalances.fees,
      paidPastDueInterest: paidBalances.unpaidInterest,
      paidInterest: paidBalances.interest,
      paidPrincipal: paidBalances.principal,
      pastDueInterest: paidBalances.unpaidInterest, //ledger.unpaidInterestBalance,
      payment: paymentAmount,
      paymentType: 'manual',
      principal: paidBalances.principal,
      startPrincipal: ledger.principalBalance,
      status: 'opened',
      transactionId: nanoid(10),
    };
    if (this.num != 0) {
      newScheduleItem.pastDueInterest = ledger.unpaidInterestBalance;
    }
    // ledger.principalBalance =
    //   ledger.principalBalance - newScheduleItem.principal;
    let principalPayoff = this.toFixed(
      ledger.principalBalance - paidBalances.principal,
      2,
    );
    let nextUnpaidInterest = this.toFixed(ledger.unpaidInterestBalance, 2);
    let recalculatedInterest = ledger.cycleAccruedInterest;
    let accruedInterestDate = moment(paymentDate).startOf('day').toDate();

    paymentSchedule.forEach((scheduleItem) => {
      if (
        moment(scheduleItem.date).startOf('day').isBefore(paymentDate, 'day')
        // &&
        // scheduleItem.endPrincipal > 0
      ) {
        newPaymentSchedule.push(scheduleItem);
      }
    });
    //let pastDuePaymentFlag = false;
    // newPaymentSchedule.every((scheduleItem, index) => {
    //   if (scheduleItem.status === 'opened') {
    //     newPaymentSchedule.splice(index, 1);
    //     pastDuePaymentFlag = true;
    //     return false;
    //   }
    //   return true;
    // });
    if (
      moment(newScheduleItem.date)
        .startOf('day')
        .isSameOrBefore(
          moment(paymentManagement.nextPaymentSchedule).startOf('day'),
          'day',
        )
    ) {
      const today = moment().startOf('day').toDate();
      const scheduledPaymentOffDate = moment(
        paymentManagement.nextPaymentSchedule,
      ).subtract(30, 'days');

      const accruedInterestDays = moment(newScheduleItem.date)
        .startOf('day')
        .diff(moment(scheduledPaymentOffDate).startOf('day'), 'days');
      let aprV: number = paymentManagement.apr;
      if (aprV == 0) {
        aprV = paymentManagement.interestApplied;
      }
      newScheduleItem.interest = isPromoAmount
        ? 0
        : this.toFixed(
            ((principalPayoff * aprV) / 100 / 365) * accruedInterestDays,
            2,
          );

      newScheduleItem.principal = this.toFixed(
        newScheduleItem.amount - newScheduleItem.interest,
        2,
      );

      if (newScheduleItem.principal > principalPayoff) {
        newScheduleItem.principal = principalPayoff;
        newScheduleItem.amount = this.toFixed(
          newScheduleItem.interest + newScheduleItem.principal,
          2,
        );
      }
      newScheduleItem.startPrincipal = principalPayoff;
      newScheduleItem.endPrincipal = this.toFixed(
        newScheduleItem.startPrincipal - newScheduleItem.principal,
        2,
      );

      principalPayoff = this.toFixed(
        principalPayoff - newScheduleItem.principal,
        2,
      );
    }

    newPaymentSchedule.push(newScheduleItem);
    // this.logger.log(
    //   'Adjusted payment management:3',
    //   `${LedgerService.name}#adjustSchedule`,
    //   requestId,
    //   JSON.stringify(newPaymentSchedule),
    // );
    const newScheduleItemIndex = newPaymentSchedule.length - 1;
    const newScheduleItemTransactionId = newScheduleItem.transactionId;
    // In non-autopay scenario, If the scheduled payment is within 30 days
    // before or is after the next scheduled payment, then we replace the
    // next scheduled item with a new one.
    if (!paymentManagement.canRunAutomaticPayment) {
      paymentSchedule.every((scheduleItem, index) => {
        const scheduledPaymentCutOffDate = moment(scheduleItem.date).subtract(
          30,
          'days',
        );
        this.logger.log(
          'Cant Run Automatic Payment ',
          `${scheduleItem.date}\n${scheduledPaymentCutOffDate}\n${index}\n${newScheduleItem.date}
          #adjustSchedule`,
          requestId,
          JSON.stringify(newScheduleItem),
        );
        if (
          moment(newScheduleItem.date)
            .startOf('day')
            .isSameOrAfter(
              moment(scheduledPaymentCutOffDate).startOf('day'),
              'day',
            ) &&
          scheduleItem.status === 'opened'
        ) {
          this.logger.log(
            'Cant Run Automatic Payment if',
            `\n${index}\n${paymentSchedule.length}\n${paymentSchedule}
             #adjustSchedule`,
            requestId,
            JSON.stringify(newScheduleItem),
          );
          paymentSchedule.splice(index, 1);
          this.logger.log(
            'Cant Run Automatic Payment if',
            `${paymentSchedule}\n${index}\n${paymentSchedule.length}
             #adjustSchedule`,
            requestId,
            JSON.stringify(newScheduleItem),
          );
          return false;
        }
        return true;
      });
    }
    if (newScheduleItem.endPrincipal > 0) {
      let indexes = 0;
      let indexes1 = 0;
      paymentSchedule.forEach((scheduleItem) => {
        if (
          moment(scheduleItem.date)
            .startOf('day')
            .isSame(moment(newScheduleItem.date).startOf('day'), 'day') &&
          scheduleItem.status === 'opened'
        ) {
          indexes1 = indexes;
        }
        indexes = indexes + 1;
      });
      indexes = 0;
      paymentSchedule.forEach((scheduleItem) => {
        if (principalPayoff === 0) {
          return;
        }
        if (
          moment(scheduleItem.date)
            .startOf('day')
            .isSameOrAfter(
              moment(newScheduleItem.date).startOf('day'),
              'day',
            ) &&
          scheduleItem.status === 'opened'
        ) {
          this.logger.log(
            'Cant Run Automatic Payment if',
            `\n${scheduleItem.date}\n${newScheduleItem.date}\n\n\n${indexes}
            \n${accruedInterestDate}
             #adjustSchedule`,
            requestId,
            JSON.stringify(newScheduleItem),
          );

          // unpaid interest

          const nextInterestPayment =
            nextUnpaidInterest >= scheduleItem.amount
              ? scheduleItem.amount
              : nextUnpaidInterest;

          if (indexes1 == 1) {
          } else {
            scheduleItem.interest = nextInterestPayment;
          }

          scheduleItem.principal = this.toFixed(
            scheduleItem.amount - scheduleItem.interest,
            2,
          );

          if (indexes1 == 1) {
            nextUnpaidInterest = this.toFixed(
              scheduleItem.interest - nextUnpaidInterest,
              2,
            );
            indexes1 = 10;
          } else {
            nextUnpaidInterest = this.toFixed(
              nextUnpaidInterest - scheduleItem.interest,
              2,
            );
          }

          // accrued interest
          const accruedInterestDays = moment(scheduleItem.date)
            .startOf('day')
            .diff(moment(accruedInterestDate).startOf('day'), 'days');
          let aprV: number = paymentManagement.apr;
          if (aprV == 0) {
            aprV = paymentManagement.interestApplied;
          }
          scheduleItem.interest = isPromoAmount
            ? 0
            : this.toFixed(
                ((principalPayoff * aprV) / 100 / 365) * accruedInterestDays,
                2,
              );

          const itemInterestPayment = this.toFixed(
            scheduleItem.interest >= scheduleItem.principal
              ? scheduleItem.principal + ledger.unpaidInterestBalance
              : scheduleItem.interest,
            2,
          );

          scheduleItem.interest = this.toFixed(
            nextUnpaidInterest + itemInterestPayment,
            2,
          );
          scheduleItem.principal = this.toFixed(
            itemInterestPayment >= scheduleItem.principal
              ? 0
              : scheduleItem.principal - itemInterestPayment,
            2,
          );

          if (scheduleItem.principal > principalPayoff) {
            scheduleItem.principal = principalPayoff;
            scheduleItem.amount = this.toFixed(
              scheduleItem.interest + scheduleItem.principal,
              2,
            );
          }
          scheduleItem.startPrincipal = principalPayoff;
          scheduleItem.endPrincipal = this.toFixed(
            scheduleItem.startPrincipal - scheduleItem.principal,
            2,
          );

          principalPayoff = this.toFixed(
            principalPayoff - scheduleItem.principal,
            2,
          );
          //if (scheduleItem.date != newScheduleItem.date) {
          newPaymentSchedule.push(scheduleItem);
          // } else {
          //   this.logger.log(
          //     'Adjusted payment management:PSKVUE 5',
          //     `${LedgerService.name}#adjustSchedule`,
          //     requestId,
          //     JSON.stringify(scheduleItem),
          //   );
          // }
          // console.log(
          //   '\n\n\n PSKV1 scheduleItem .date FIRST CHECK schedule' +
          //     JSON.stringify(scheduleItem),
          // );
          accruedInterestDate = scheduleItem.date;
          recalculatedInterest = this.toFixed(
            recalculatedInterest + ledger.unpaidInterestBalance,
            2,
          );
        }
      });
    }

    paymentManagement.paymentSchedule = newPaymentSchedule;

    const response = {
      newPaymentManagement: paymentManagement,
      newScheduleItemIndex,
      newScheduleItemTransactionId,
    };
    // this.logger.log(
    //   'Adjusted payment management:',
    //   `${LedgerService.name}#adjustSchedule`,
    //   requestId,
    //   response,
    // );

    return response;
  }

  amortizeSchedule(
    amount: number,
    paymentManagement: PaymentManagementDocument,
    requestId: string,
    lateFeeThreshold?: Date,
    lateFeeAmount?: number,
    promo?: bool,
    ledger?: ILedger,
  ): IPaymentScheduleItem[] {
    const paymentDate = moment().startOf('day').toDate();
    if (!ledger) {
      ledger = this.ledgerService.getPaymentLedger(
        paymentManagement,
        paymentDate,
        requestId,
      );
    }

    const {
      paymentSchedule,
      interestApplied,
      promoPaymentAmount,
      promoStatus,
    } = paymentManagement;

    let { apr } = paymentManagement;
    if (apr == 0) {
      apr = interestApplied;
    }
    const newPaymentSchedule: IPaymentScheduleItem[] = [];
    const nextScheduleItem = paymentSchedule.find(
      (scheduleItem) => scheduleItem.status === 'opened',
    );
    let principalPayoff = this.toFixed(ledger.principalBalance, 2);
    let nextUnpaidInterest = this.toFixed(ledger.unpaidInterestBalance, 2);
    let recalculatedInterest = ledger.cycleAccruedInterest;
    let accruedInterestDate = moment(nextScheduleItem.date)
      .startOf('day')
      .toDate();
    let week = nextScheduleItem.week;

    paymentSchedule.forEach((scheduleItem: any) => {
      if (
        moment(scheduleItem.date).isSameOrBefore(paymentDate, 'day') &&
        scheduleItem.status === 'paid'
      ) {
        newPaymentSchedule.push(scheduleItem);
      } else if (
        moment(scheduleItem.date).isSameOrBefore(paymentDate, 'day') &&
        scheduleItem.status === 'failed'
      ) {
        newPaymentSchedule.push(scheduleItem);
      }
    });

    while (principalPayoff > 0) {
      // empty schedule
      const oldScheduleItem = paymentSchedule.find(
        (scheduleItem) =>
          scheduleItem.status === 'opened' &&
          moment(scheduleItem.date).isSame(accruedInterestDate),
      );
      const newScheduleItem: IPaymentScheduleItem = {
        amount,
        date: accruedInterestDate,
        endPrincipal: 0,
        fees: oldScheduleItem.fees || 0,
        nsfFee: oldScheduleItem.nsfFee || 0,
        interest: 0,
        week,
        paidFees: 0,
        paidInterest: 0,
        paidPastDueInterest: 0,
        paidPrincipal: 0,
        pastDueInterest: 0,
        payment: 0,
        paymentType: 'automatic',
        principal: 0,
        startPrincipal: 0,
        status: 'opened',
        transactionId: nanoid(10),
        nsfFeeApplied: oldScheduleItem.nsfFeeApplied,
        lateFeeApplied: oldScheduleItem.lateFeeApplied,
      };

      // unpaid interest
      const nextInterestPayment =
        nextUnpaidInterest >= newScheduleItem.amount
          ? newScheduleItem.amount
          : nextUnpaidInterest;
      newScheduleItem.interest = nextInterestPayment;
      newScheduleItem.principal = this.toFixed(
        newScheduleItem.amount - newScheduleItem.interest,
        2,
      );
      nextUnpaidInterest = this.toFixed(
        nextUnpaidInterest - newScheduleItem.interest,
        2,
      );

      // accrued interest
      const accruedInterestDays = moment(accruedInterestDate)
        .add(1, 'week')
        .startOf('day')
        .diff(moment(accruedInterestDate).startOf('day'), 'days');
      let isPromoAmount = false;

      if (promo == true) {
        isPromoAmount =
          amount >= promoPaymentAmount && promoStatus === 'available'
            ? true
            : false;
      }
      newScheduleItem.interest = isPromoAmount
        ? 0
        : this.toFixed(
            ((principalPayoff * apr) / 100 / 365) * accruedInterestDays,
            2,
          );

      const itemInterestPayment = this.toFixed(
        newScheduleItem.interest >= newScheduleItem.principal
          ? newScheduleItem.principal + ledger.unpaidInterestBalance
          : newScheduleItem.interest,
        2,
      );

      newScheduleItem.interest = this.toFixed(
        nextUnpaidInterest + itemInterestPayment,
        2,
      );
      newScheduleItem.principal = this.toFixed(
        itemInterestPayment >= newScheduleItem.principal
          ? newScheduleItem.principal
          : newScheduleItem.principal - itemInterestPayment,
        2,
      );
      if (newScheduleItem.principal > principalPayoff) {
        newScheduleItem.principal = principalPayoff;
        newScheduleItem.amount = this.toFixed(
          newScheduleItem.interest + newScheduleItem.principal,
          2,
        );
      }
      newScheduleItem.startPrincipal = principalPayoff;

      principalPayoff = this.toFixed(
        principalPayoff - newScheduleItem.principal,
        2,
      );

      if (
        moment(newScheduleItem.date)
          .startOf('day')
          .isSameOrBefore(lateFeeThreshold)
      ) {
        if (newScheduleItem.fees == 0 && !oldScheduleItem?.lateFeeApplied) {
          newScheduleItem.fees += lateFeeAmount;
          newScheduleItem.amount += lateFeeAmount;
          newScheduleItem.lateFeeApplied = true;
        }
      }
      newPaymentSchedule.push(newScheduleItem);
      accruedInterestDate = moment(accruedInterestDate)
        .add(1, 'week')
        .startOf('day')
        .toDate();
      recalculatedInterest = this.toFixed(
        recalculatedInterest + ledger.unpaidInterestBalance,
        2,
      );
      week++;
    }

    const response = newPaymentSchedule;
    return response;
  }

  async getPaymentSchedule(request: any, token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const findUser = await this.userModel.findOne({
      customerUpdateToken: hashedToken,
      customerUpdateTokenExpires: { $gt: new Date() },
    });

    if (!findUser) {
      const errorMessage = 'Invalid user';
      this.logger.error(
        errorMessage,
        `${PaymentService.name}#getPaymentSchedule`,
        request.id,
      );

      throw new UnauthorizedException();
    }

    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: findUser._id,
    });
    // Updated Loan Status to Closed
    const paymentManagement = await this.paymentManagementModel.findOne({
      screenTracking: findscreenTracking._id,
    });
    if (!paymentManagement) {
      this.logger.log(
        'Payment schedule not found',
        `${PaymentService.name}#getPaymentSchedule`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Refund Payment management not found for user id ${findscreenTracking._id}`,
          request.id,
        ),
      );
    }

    return paymentManagement;
  }

  toFixed(number: number, precision: number) {
    return parseFloat(number.toFixed(precision));
  }

  async triggerAutoPay(
    request: any,
    paymentManagementId: string,
    status?: boolean,
  ) {
    if (status == undefined) {
      const paymentManagementData = await this.paymentManagementModel.findOne({
        _id: paymentManagementId,
      });
      status = !paymentManagementData.canRunAutomaticPayment;
    }
    await this.paymentManagementModel.findByIdAndUpdate(paymentManagementId, {
      canRunAutomaticPayment: status,
    });
    const paymentManagementData = await this.paymentManagementModel.findOne({
      _id: paymentManagementId,
    });
    const findUser = await this.userModel.findOne({
      _id: paymentManagementData.user,
    });
    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: findUser._id,
    });
    await this.logActivityService.createLogActivityUpdateUser(
      request,
      logActivityModuleNames.PAYMENT_SCHEDULE,
      `${findUser.email} - ${findUser.userReference} AutoPay Status changed to ${status}`,
      {
        userId: findUser._id,
      },
      findscreenTracking._id,
      findUser,
    );
  }

  async handleReturnedPayment(
    screenTrackingId: string,
    paymentRef: string,
    requestId = '',
  ) {
    const paymentManagementData = await this.paymentManagementModel
      .findOne({
        screenTracking: screenTrackingId,
      })
      .populate(['user', 'screenTracking']);
    if (paymentManagementData) {
      const { paymentSchedule } = paymentManagementData;

      const newPaymentSchedule = [...paymentSchedule];

      // const paymentIndex = paymentSchedule.findIndex(
      //   (payment) => payment.paymentReference === paymentRef,
      // );

      const paymentIndex = paymentSchedule.findIndex(
        (payment) => payment.paymentReference === paymentRef,
      );

      const currentPayment = { ...paymentSchedule[paymentIndex] };

      const failedPayment = Object.create({
        ...currentPayment,
        paidPrincipal: 0,
        endPrincipal: currentPayment.startPrincipal,
        status: 'failed',
      }) as IPaymentScheduleItem;

      const returnedPayment = Object.create({
        ...currentPayment,
        paymentReference: `${currentPayment.paymentReference} - RETURNED`,
        status: 'opened',
        paidPrincipal: 0,
        endPrincipal: currentPayment.startPrincipal,
      }) as IPaymentScheduleItem;

      newPaymentSchedule.splice(paymentIndex, 1, failedPayment);
      newPaymentSchedule.push(returnedPayment);

      await this.paymentManagementModel.findByIdAndUpdate(
        paymentManagementData._id,
        {
          paymentSchedule: newPaymentSchedule,
        },
      );

      await this.paymentFailure(
        paymentManagementData.user as UserDocument,
        currentPayment.amount,
        'ACH payment being returned',
      );
    }
  }
}
