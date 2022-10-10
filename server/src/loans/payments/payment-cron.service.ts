import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';
import { Model } from 'mongoose';

import { LoggerService } from '../../logger/logger.service';
import { UserDocument } from '../../user/user.schema';
import {
  LoanPaymentProCardToken,
  LoanPaymentProCardTokenDocument,
} from './loanpaymentpro/schemas/loanpaymentpro-card-token.schema';
import {
  PaymentManagement,
  PaymentManagementDocument,
} from './payment-management/payment-management.schema';
import { IPaymentScheduleItem } from './payment-management/payment-schedule-item.interface';
import { IPaymentScheduleStatusItem } from './payment-management/payment-schedule-transactionstatus.interface';
import { PaymentDocument } from './payment.schema';
import { PaymentService } from './payment.service';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../user/screen-tracking/screen-tracking.schema';

@Injectable()
export class PaymentCronService {
  constructor(
    @InjectModel(LoanPaymentProCardToken.name)
    private readonly loanPaymentProCardTokenModel: Model<LoanPaymentProCardTokenDocument>,
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    private readonly paymentService: PaymentService,
    private readonly logger: LoggerService,
    private readonly logActivityService: LogActivityService,
  ) {}
  //EVERY_MINUTE
  @Cron(CronExpression.EVERY_DAY_AT_8PM) // 1pm PDT
  async makeAutomaticPayment() {
    const today: Date = moment().startOf('day').toDate();
    this.logger.log(
      'Running automatic payment cron',
      `${PaymentService.name}#makeAutomaticPayment\n\n\n${today}`,
    );
    let paymentManagementId = '';
    let scheduleItemIndex = 0;
    let paymentSchedule: IPaymentScheduleItem[];

    try {
      // check for payments due today
      const paymentManagements: PaymentManagementDocument[] | null =
        await this.paymentManagementModel.find({
          status: {
            $in: [
              'in-repayment',
              'in-repayment prime',
              'in-repayment non-prime',
              'in-repayment delinquent1',
              'in-repayment delinquent2',
              'in-repayment delinquent3',
              'in-repayment delinquent4',
            ],
          },
          canRunAutomaticPayment: true,
        });
      if (!paymentManagements || paymentManagements.length <= 0) {
        this.logger.log(
          'No active loans found',
          `${PaymentService.name}#makeAutomaticPayment`,
        );
        return;
      }

      for (const paymentManagement of paymentManagements) {
        const user = paymentManagement.user as UserDocument;
        const screenTracking =
          paymentManagement.screenTracking as ScreenTrackingDocument;

        try {
          // get default card token
          paymentManagementId = paymentManagement._id;
          const cardToken = await this.loanPaymentProCardTokenModel.findOne({
            user,
            // paymentType: 'ACH',
            isDefault: true,
          });

          if (!cardToken) {
            this.logger.error(
              `Payment method token for user id ${user._id} not found`,
              `${PaymentService.name}#makeAutomaticPayment`,
            );
            continue;
          }

          // find schedule items
          const paymentScheduleItems: IPaymentScheduleItem[] =
            paymentManagement.paymentSchedule.filter(
              (scheduleItem) =>
                moment(scheduleItem.date)
                  .subtract(1, 'day') // allowing ACH to run end of previous day
                  .startOf('day')
                  .isSame(today) && ['opened'].includes(scheduleItem.status),
            );
          if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
            continue;
          }

          this.logger.log(
            `Processing automatic payment for payment management id ${paymentManagementId}`,
            `${PaymentService.name}#makeAutomaticPayment`,
          );
          paymentSchedule = paymentManagement.paymentSchedule;
          for (const paymentScheduleItem of paymentScheduleItems) {
            scheduleItemIndex = paymentSchedule.findIndex(
              (scheduleItem) =>
                scheduleItem.transactionId ===
                paymentScheduleItem.transactionId,
            );

            // make payment
            const paymentAmount = paymentScheduleItem.week
              ? paymentManagement.currentPaymentAmount
              : paymentScheduleItem.amount;
            const payment: PaymentDocument =
              await this.paymentService.makePayment(
                paymentManagement,
                cardToken.id,
                paymentAmount,
              );
            paymentScheduleItem.payment = paymentAmount;
            paymentScheduleItem.paidInterest = paymentScheduleItem.interest;
            paymentScheduleItem.paidPrincipal = paymentScheduleItem.principal;
            paymentScheduleItem.status = 'paid';
            paymentScheduleItem.paymentType = 'automatic';
            paymentScheduleItem.paymentReference = payment.paymentReference;
            paymentScheduleItem.paymentDate = today;
            paymentScheduleItem.transactionMessage = payment.transactionMessage;
            paymentScheduleItem.transId = payment.transId;

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
              `Automatic payment for payment management id ${paymentManagementId} processed successfully.`,
              `${PaymentService.name}#makeAutomaticPayment`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Could not process automatic payment for payment management id ${paymentManagementId}`,
            `${PaymentService.name}#makeAutomaticPayment`,
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
          let payIndex = 0;
          paymentSchedule.forEach(async (scheduleItem) => {
            payIndex = payIndex + 1;

            if (moment(scheduleItem.date).isSame(today, 'day')) {
              if (
                scheduleItem.status != 'failed' &&
                scheduleItem.status != 'paid'
              ) {
                if (scheduleItem.transactionStatus.length >= 1) {
                  scheduleItem.transactionStatus.push(transactionStatus);
                  newPaymentSchedule.push(scheduleItem);

                  const cronRequestObj = {
                    user,
                    id: '',
                    connection: { remoteAddress: 'Cron Execution' },
                    url: '/DelinquencyCron',
                  };

                  await this.logActivityService.createLogActivityUpdateUser(
                    cronRequestObj,
                    logActivityModuleNames.PAYMENT_SCHEDULE,
                    `${user.userReference} Automatic payment failed. Details: ${error.message} `,
                    {
                      userId: user._id,
                    },
                    screenTracking._id,
                    user,
                  );

                  await this.paymentService.triggerAutoPay(
                    cronRequestObj,
                    paymentManagementId,
                    false,
                  );

                  await this.paymentManagementModel.findByIdAndUpdate(
                    paymentManagementId,
                    {
                      canRunAutomaticPayment: false,
                    },
                  );
                }
              }
            }
            if (moment(scheduleItem.date).isAfter(today, 'day')) {
              newPaymentSchedule.push(scheduleItem);
            }
          });

          await this.paymentManagementModel.findByIdAndUpdate(
            paymentManagementId,
            {
              paymentSchedule: newPaymentSchedule,
            },
          );
        }
      }
      this.logger.log(
        'Ran automatic payment cron',
        `${PaymentService.name}#makeAutomaticPayment`,
      );
    } catch (error) {
      this.logger.log(
        `Internal server error`,
        `${PaymentService.name}#makeAutomaticPayment`,
        undefined,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkAndProcessCollectionContracts() {
    const paymentManagements: PaymentManagementDocument[] | null =
      await this.paymentManagementModel.find({
        collectionsAccountStatus: 'PROMISE_TO_PAY',
      });
    if (paymentManagements && paymentManagements.length > 0) {
      for (const paymentManagement of paymentManagements) {
        this.checkPromiseToPay(paymentManagement);
      }
    }
  }

  async checkPromiseToPay(paymentManagement: PaymentManagementDocument) {
    const contactScheduleMoment = moment(
      paymentManagement.promiseToPay[0].contactScheduleReminderDate,
    );
    if (moment().diff(contactScheduleMoment) >= 0) {
      paymentManagement.collectionsAccountStatus =
        'PROMISE_TO_PAY_CONTACT_NEEDED';
      await this.paymentManagementModel.updateOne(
        { _id: paymentManagement._id },
        paymentManagement,
      );
    }
  }

  addDays(days: number, dates: Date): Date {
    const futureDate = dates;
    futureDate.setDate(futureDate.getDate() + days);
    return futureDate;
  }
}
