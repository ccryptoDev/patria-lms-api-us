import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';

import { LoggerService } from '../../../logger/logger.service';
import { LoanSettingsService } from '../../loan-settings/loan-settings.service';
import {
  PaymentManagement,
  PaymentManagementDocument,
} from './payment-management.schema';
import {
  COMMUNICATION_CODE,
  IPaymentScheduleItem,
  UNDERWRITING_RULES,
} from './payment-schedule-item.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../../user/screen-tracking/screen-tracking.schema';
import { PaymentService } from '../../payments/payment.service';
import { MandrillService } from '../../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../../nunjucks-compiler/nunjucks-compiler.service';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../../user/user.schema';
import { Roles, RolesDocument } from '../../../user/roles/roles.schema';
import { Admin, AdminDocument } from '../../../user/admin/admin.schema';
import { FlexPayService } from '../flex-pay/flex-pay.service';
import {
  FlexTransactionReport,
  TransactionStatus,
} from '../flex-pay/flex.schema';
import axios, { Axios } from 'axios';
import config from '../../../app.config';

@Injectable()
export class PaymentManagementCronService {
  constructor(
    @InjectModel(PaymentManagement.name)
    private readonly PaymentManagementModel: Model<PaymentManagementDocument>,
    private readonly logger: LoggerService,
    private readonly loanSettingsService: LoanSettingsService,
    private readonly paymentService: PaymentService,
    private readonly mailService: MandrillService,
    private readonly nunjucksService: NunjucksCompilerService,
    private readonly configService: ConfigService,
    private readonly flexPayService: FlexPayService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    @InjectModel(Roles.name) private readonly rolesModel: Model<RolesDocument>,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkPromoAvailability() {
    this.logger.log(
      'Running promo availability cron',
      `${PaymentManagementCronService.name}#checkPromoAvailability`,
    );
    try {
      const paymentManagements: PaymentManagementDocument[] = await this.PaymentManagementModel.find(
        { promoStatus: 'available' },
      );
      if (!paymentManagements || paymentManagements.length <= 0) {
        this.logger.log(
          'No payment management with available promo found',
          `${PaymentManagementCronService.name}#checkPromoAvailability`,
        );
      }

      for (const paymentManagement of paymentManagements) {
        try {
          if (
            moment()
              .startOf('day')
              .isAfter(
                moment(paymentManagement.loanStartDate)
                  .add(paymentManagement.promoTermCount, 'months')
                  .startOf('day'),
              )
          ) {
            this.logger.log(
              `Setting promoStatus to unavailable for PaymentManagement id ${paymentManagement._id} `,
              `${PaymentManagementCronService.name}#checkPromoAvailability`,
            );
            await this.PaymentManagementModel.updateOne(
              {
                _id: paymentManagement._id,
              },
              { promoStatus: 'unavailable' },
            );
            this.logger.log(
              `promoStatus set to unavailable for paymentManagement id ${paymentManagement._id} `,
              `${PaymentManagementCronService.name}#checkPromoAvailability`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Could not update promoStatus for PaymentManagement id ${paymentManagement._id}`,
            `${PaymentManagementCronService.name}#checkPromoAvailability`,
            undefined,
            error,
          );
        }
      }
      this.logger.log(
        'Ran promo availability cron',
        `${PaymentManagementCronService.name}#checkPromoAvailability`,
      );
    } catch (error) {
      this.logger.error(
        'Error',
        `${PaymentManagementCronService.name}#checkPromoAvailability`,
        undefined,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredApplications() {
    this.logger.log(
      'Running expired applications cron',
      `${PaymentManagementCronService.name}#checkExpiredApplications`,
    );
    const expirationLimit = moment()
      .subtract(45, 'days')
      .startOf('day')
      .toDate();

    try {
      const { nModified } = await this.PaymentManagementModel.updateMany(
        {
          createdAt: { $lte: expirationLimit },
          status: { $in: ['approved', 'denied', 'pending'] },
        },
        {
          status: 'expired',
        },
      );
      this.logger.log(
        `Set ${nModified} application(s) as expired`,
        `${PaymentManagementCronService.name}#checkExpiredApplications`,
      );
      this.logger.log(
        'Expired applications cron ran',
        `${PaymentManagementCronService.name}#checkExpiredApplications`,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${PaymentManagementCronService.name}#checkExpiredApplications`,
        undefined,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9PM) // PDT 2 PM
  async delinquencyCron() {
    this.logger.log(
      'Running delinquency cron',
      `${PaymentManagementCronService.name}#delinquencyCron`,
    );
    let paymentManagementId = '';

    const loanSettings = await this.loanSettingsService.getLoanSettings();
    const today: Date = moment().startOf('day').toDate();
    const lateFeeThreshold: Date = moment(today)
      .subtract(loanSettings.lateFeeGracePeriod, 'day')
      .startOf('day')
      .toDate();

    try {
      // check for payments due today
      const paymentManagements:
        | PaymentManagementDocument[]
        | null = await this.PaymentManagementModel.find({
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
        // screenTracking: '6316557011db2742dc99deb2',
      }).populate('screenTracking');
      if (!paymentManagements || paymentManagements.length <= 0) {
        this.logger.log(
          'No active loans found',
          `${PaymentManagementCronService.name}#delinquencyCron`,
        );
        return;
      }
      const delinquentArray = [];
      for (const paymentManagement of paymentManagements) {
        try {
          paymentManagementId = paymentManagement._id;
          const screenTracking: ScreenTrackingDocument = paymentManagement.screenTracking as ScreenTrackingDocument;

          // find next available payment schedule items that is before today's date
          const paymentScheduleItems: IPaymentScheduleItem[] = paymentManagement.paymentSchedule.filter(
            (scheduleItem) =>
              moment(scheduleItem.date).startOf('day').isBefore(today) &&
              scheduleItem.status === 'opened',
          );

          // If there is no late payments in the schedule
          if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
            await this.PaymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                status: 'in-repayment',
              },
            );
            continue;
          } else {
            const furthestLatePayment = paymentScheduleItems[0];
            const updateStatus: PaymentManagementDocument['status'] = await this.determineDelinquentTier(
              moment(today).diff(furthestLatePayment.date, 'day'),
            );
            const delinquentDays = moment(today).diff(
              furthestLatePayment.date,
              'day',
            );
            await this.PaymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                status: updateStatus,
                delinquentDays: moment(today).diff(
                  furthestLatePayment.date,
                  'day',
                ),
              },
            );
            const findUser = await this.userModel.findOne({
              _id: paymentManagement.user,
            });
            if (!findUser) {
            } else {
              if (
                moment(today).diff(furthestLatePayment.date, 'day') == 1 ||
                moment(today).diff(furthestLatePayment.date, 'day') == 31 ||
                moment(today).diff(furthestLatePayment.date, 'day') == 61 ||
                moment(today).diff(furthestLatePayment.date, 'day') == 91
              ) {
                delinquentArray.push({
                  Name: `${findUser.email}`,
                  Day: `Day ${delinquentDays}`,
                });
              }
            }
          }

          this.logger.log(
            `Processing delinquency status for payment management id ${paymentManagementId}`,
            `${PaymentManagementCronService.name}#delinquencyCron`,
          );

          const newPaymentManagement: PaymentManagementDocument | null = await this.PaymentManagementModel.findOne(
            {
              screenTracking,
            },
          );
          const { minimumPaymentAmount } = paymentManagement;
          const newPaymentSchedule = await this.paymentService.amortizeSchedule(
            minimumPaymentAmount,
            newPaymentManagement,
            'Delinquency Cron',
            lateFeeThreshold,
            loanSettings.lateFee,
          );
          await this.PaymentManagementModel.updateOne(
            { _id: paymentManagement._id },
            {
              currentPaymentAmount: minimumPaymentAmount,
              paymentSchedule: newPaymentSchedule,
            },
          );
        } catch (error) {
          this.logger.error(
            `Could not process automatic payment for payment management id ${paymentManagementId}`,
            `${PaymentManagementCronService.name}#delinquencyCron`,
            undefined,
            error,
          );
        }
      }

      if (delinquentArray.length > 0) {
        const role: RolesDocument | null = await this.rolesModel.findOne({
          roleName: 'Super Admin',
        });
        if (!role) {
        } else {
          const admin: AdminDocument[] | null = await this.adminModel.find({
            role: role._id,
          });
          for (const adminV of admin) {
            if (!adminV) {
            } else {
              let tableString = '<table><tr>';

              Object.keys(delinquentArray[0]).forEach(function (array) {
                tableString += '<th>' + array + '</th>';
              });

              tableString += '</tr> <tbody>';

              delinquentArray.forEach(function (array) {
                tableString +=
                  '<tr> <td>' +
                  array.Name +
                  '</td> <td>' +
                  array.Day +
                  '</td> </tr>';
              });
              tableString += '</tbody> </table>';

              const baseUrl = this.configService.get<string>('VUE_APP_URL');
              const html = await this.nunjucksService.htmlToString(
                'emails/application-delinquent.html',
                {
                  userName: adminV.userName,
                  tableString: tableString,
                  link: `${baseUrl}/admin/login`,
                },
              );
              const subject = 'Action Items';
              const from = 'no-reply@patrialending.com';
              const to = adminV.email;

              await this.mailService.sendEmail(from, to, subject, html, '');
            }
          }
        }
      }
      this.logger.log(
        'Ran delinquency cron',
        `${PaymentManagementCronService.name}#delinquencyCron`,
      );
    } catch (error) {
      this.logger.log(
        `Internal server error`,
        `${PaymentManagementCronService.name}#delinquencyCron`,
        undefined,
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateReturnedACHPayments(dateRange = 0, sendEmail = true) {
    try {
      const requestId = String(Date.now());
      const transactions = await this.flexPayService.getReturnedACHPayments(
        requestId,
        dateRange,
      );

      this.logger.log(
        'Updated Transactions',
        `${PaymentManagementCronService.name}#updateReturnedACHPayments::transactions.length `,
        requestId,
        transactions.length,
      );

      for (const {
        transaction,
        screenTracking: screenTrackingId,
        paymentRef,
      } of transactions) {
        const paymentManagement = await this.PaymentManagementModel.findOne({
          screenTracking: screenTrackingId,
        });

        this.logger.log(
          'Payment Management',
          `${PaymentManagementCronService.name}#updateReturnedACHPayments::paymentManagement`,
          requestId,
          paymentManagement,
        );

        if (!paymentManagement) {
          continue;
        }

        this.logger.log(
          'Returned Payment',
          `${PaymentManagementCronService.name}#updateReturnedACHPayments::transaction`,
          requestId,
          transaction,
        );

        await this.paymentService.handleReturnedPayment(
          screenTrackingId as string,
          paymentRef,
          requestId,
          transaction.returnMessage,
          sendEmail,
        );
      }
    } catch (error) {
      this.logger.error('ERROR::updateReturnedACHPayments:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateSettledACHPayments(dateRange = 0) {
    try {
      const requestId = String(Date.now());
      const transactions = await this.flexPayService.getSettledPayments(
        requestId,
        dateRange,
      );

      this.logger.log(
        'Updated Transactions',
        `${PaymentManagementCronService.name}#updateSettledACHPayments::transactions.length `,
        requestId,
        transactions.length,
      );
    } catch (error) {
      this.logger.error('ERROR::updateSettledACHPayments:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkCardChargedTransaction() {
    try {
      const requestId = String(Date.now());
      const transactions = await this.flexPayService.getChargedCardTransaction();
      const { data, ok, error } = transactions;

      if (!ok) {
        this.logger.log(
          'Got Error While Getting Pending Transaction from Database',
          `${PaymentManagementCronService.name}#checkCardChargedTransaction::transactions`,
          requestId,
          error,
        );
        throw new HttpException(
          'Got Error While Getting Pending Transaction from Database',
          500,
        );
      }

      for (let i = 0; i < data.length; i++) {
        const flexReport = data[i];

        if (!flexReport) continue;
        const { transaction } = flexReport;

        if (!transaction) continue;

        if (
          transaction.response === TransactionStatus.PENDING ||
          transaction.status === TransactionStatus.IN_SETTLEMENT
        ) {
          const newFlexReport = await this.flexPayService.getChargedCardStatus(
            transaction,
          );
          if (!newFlexReport.ok) {
            this.logger.error(
              'Got Error While Getting Status From Flex API',
              `${PaymentManagementCronService.name}#checkCardChargedTransaction::transactions`,
              requestId,
              newFlexReport.error,
            );
            continue;
          }
          const newFlexReportTransaction = newFlexReport?.data?.data;
          const {
            status: newStatus,
            response: newResponse,
          } = newFlexReportTransaction;

          if (
            newResponse === TransactionStatus.APPROVED.toLowerCase() ||
            newStatus === TransactionStatus.SETTLED.toLowerCase()
          ) {
            const query = { _id: flexReport._id };
            const payload = {
              'transaction.response': newResponse,
              'transaction.status': newStatus,
            };
            this.flexPayService.updateTransactionContext(query, payload);
          }
          return newFlexReport;
        }
      }

      this.logger.log(
        'Cron Job Completed Successfully Pending Transactions Re-Check',
        `${PaymentManagementCronService.name}#checkCardChargedTransaction::transactions`,
        requestId,
        null,
      );
    } catch (error) {
      this.logger.error('ERROR::checkCardChargedTransaction:', error);
    }
  }

  //@Cron(CronExpression.EVERY_DAY_AT_2AM)
  async moveCollections() {
    this.logger.log(
      'Running Collections in and out cron',
      `${PaymentManagementCronService.name}#moveCollections`,
    );

    this.logger.log(
      'Running moveCollections cron',
      `${PaymentManagementCronService.name}#moveCollectionsCron`,
    );
    let paymentManagementId = '';

    const loanSettings = await this.loanSettingsService.getLoanSettings();
    const today: Date = moment().startOf('day').toDate();
    const lateFeeThreshold: Date = moment(today)
      .subtract(loanSettings.lateFeeGracePeriod, 'day')
      .startOf('day')
      .toDate();

    try {
      // check for payments due today
      const paymentManagements:
        | PaymentManagementDocument[]
        | null = await this.PaymentManagementModel.find({
        status: {
          $in: [
            'in-repayment prime',
            'in-repayment non-prime',
            'in-repayment delinquent1',
            'in-repayment delinquent2',
            'in-repayment delinquent3',
            'in-repayment delinquent4',
          ],
        },
      }).populate('screenTracking');
      if (!paymentManagements || paymentManagements.length <= 0) {
        this.logger.log(
          'No active loans found',
          `${PaymentManagementCronService.name}#delinquencyCron`,
        );
        return;
      }

      for (const paymentManagement of paymentManagements) {
        try {
          paymentManagementId = paymentManagement._id;
          const screenTracking: ScreenTrackingDocument = paymentManagement.screenTracking as ScreenTrackingDocument;
          // find next available payment schedule items that  before today's date
          const paymentScheduleItems: IPaymentScheduleItem[] = paymentManagement.paymentSchedule.filter(
            (scheduleItem) =>
              moment(scheduleItem.date).startOf('day').isBefore(today) &&
              scheduleItem.status === 'opened',
          );

          // If there is no late payments in the schedule
          if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
            await this.PaymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                status: 'in-repayment prime',
              },
            );
            continue;
          } else {
            const furthestLatePayment = paymentScheduleItems[0];
            const collectionStatus: PaymentManagementDocument['collectionAssignStatus'] = await this.determineCollectionTier(
              moment(today).diff(furthestLatePayment.date, 'day'),
              loanSettings.delinquencyPeriod,
            );
            let collectionAccountStatus: PaymentManagementDocument['collectionsAccountStatus'] =
              '';
            if (collectionStatus != '') {
              collectionAccountStatus = 'WAITING_TO_COLLECT';
            }
            await this.PaymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                collectionAssignStatus: collectionStatus,
                collectionsAccountStatus: collectionAccountStatus,
              },
            );
          }

          this.logger.log(
            `Processing moveCollections status for payment management id ${paymentManagementId}`,
            `${PaymentManagementCronService.name}#moveCollectionsCron`,
          );
        } catch (error) {
          this.logger.error(
            `Could not process moveCollectionsfor payment management id ${paymentManagementId}`,
            `${PaymentManagementCronService.name}#moveCollectionsCron`,
            undefined,
            error,
          );
        }
      }
      this.logger.log(
        'Ran moveCollections cron',
        `${PaymentManagementCronService.name}#moveCollectionsCron`,
      );
    } catch (error) {
      this.logger.log(
        `Internal server error`,
        `${PaymentManagementCronService.name}#moveCollectionsCron`,
        undefined,
        error,
      );
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
    if (days < 28) {
      return 'in-repayment delinquent1';
    } else if (days < 56) {
      return 'in-repayment delinquent2';
    } else if (days < 84) {
      return 'in-repayment delinquent3';
    } else {
      return 'in-repayment delinquent4';
    }
  }

  /* #INFO 
    This email reminder for LDS and COAL communicatio code
    which target the user who got failed or retried by Underwriting rules 
  */
  @Cron(CronExpression.EVERY_HOUR)
  async emailReminder() {
    try {
      const LDS_RuleIds = [];
      const COAL_RuleIds = [];
      for (const [key, value] of Object.entries(UNDERWRITING_RULES)) {
        const { communicationCode, ruleId } = value;
        if (communicationCode === COMMUNICATION_CODE.LDA)
          LDS_RuleIds.push(ruleId);
        if (communicationCode === COMMUNICATION_CODE.COAL)
          COAL_RuleIds.push(ruleId);
      }

      // const coalApplication = await this.getCoalAndCoaApplications(
      //   COAL_RuleIds,
      // );
      // return coalApplication;
      const LdsApplication = await this.getLdsApplications(LDS_RuleIds);
      return LdsApplication;
    } catch (error) {
      this.logger.error(
        'ERROR COAL, COA and LDA Email Reminder cron',
        `${PaymentManagementCronService.name}#emailReminder`,
      );
    }
  }

  async getLdsApplications(LDA_RuleIds: Array<string>) {
    try {
      const toEmailList = [];
      const query = {
        $and: [
          { 'underwritingDecision.ruleId': { $in: LDA_RuleIds } },
          { lastlevel: { $gt: 4, $lte: 6 } },
        ],
      };
      const screenData = await this.screenTrackingModel
        .find(query)
        .populate('user');

      await Promise.all(
        screenData.map(async (application) => {
          const { user, updatedAt } = application;
          const userData = user as UserDocument;
          const payloadObject = {
            communicationCode: COMMUNICATION_CODE.LDA,
            email: userData.email,
          };

          let LDA_emailAlert = application.LDA_emailAlert;
          if (!LDA_emailAlert) LDA_emailAlert = { day: 0, time: null };

          if (!LDA_emailAlert?.day) {
            toEmailList.push(payloadObject);
          } else if (LDA_emailAlert?.day < 8) {
            const today: any = new Date();
            const date2: any = new Date(LDA_emailAlert.time);
            const hours = Math.abs(today - date2) / 36e5;
            if (hours < 6 || hours > 6.7) return;
            toEmailList.push(payloadObject);
          }
          LDA_emailAlert.day += 1;
          LDA_emailAlert.time = new Date();

          application.LDA_emailAlert = LDA_emailAlert;
          await application.save();
        }),
      );
      const payload = {
        emails: toEmailList,
        communicationCode: COMMUNICATION_CODE.LDA,
      };

      this.sendEmailReminder(payload);
      return { toEmailList, screenData };
    } catch (error) {
      this.logger.error(
        'Running COAL, COA and LDA Email Reminder cron',
        `${PaymentManagementCronService.name}#emailReminder`,
        error,
      );
    }
  }

  async getCoalAndCoaApplications(COAL_RuleIds: Array<string>) {
    try {
      const toEmailList = [];
      const query = {
        $and: [
          { 'underwritingDecision.ruleId': { $in: COAL_RuleIds } },
          { lastlevel: 3 },
        ],
      };
      const screenData = await this.screenTrackingModel
        .find(query)
        .populate('user');

      await Promise.all(
        screenData.map(async (application) => {
          const { user, updatedAt, origin } = application;
          const userData = user as UserDocument;

          let COAL_emailAlert = application.COAL_emailAlert;
          if (!COAL_emailAlert) COAL_emailAlert = new Date(updatedAt);

          const today: any = new Date();
          const date2: any = new Date(COAL_emailAlert);
          const hours = Math.abs(today - date2) / 36e5;
          const conditionsOfIntervals = {
            firstInterval: hours >= 1 && hours <= 2,
            secondInterval: hours >= 6 && hours <= 7,
            thirdInterval: hours >= 24 && hours <= 26,
            forthInterval: hours >= 48 && hours <= 49,
          };

          const payloadObject = {
            communicationCode:
              origin === 'WEB'
                ? COMMUNICATION_CODE.COAL
                : COMMUNICATION_CODE.COA,
            email: userData.email,
          };

          if (Object.values(conditionsOfIntervals).includes(true)) {
            toEmailList.push(payloadObject);
            application.COAL_emailAlert = today;
            await application.save();
          }
        }),
      );
      const payload = {
        emails: toEmailList,
      };
      this.sendEmailReminder(payload);
    } catch (error) {
      this.logger.error(
        'Running COAL, COA and LDA Email Reminder cron',
        `${PaymentManagementCronService.name}#emailReminder`,
        error,
      );
    }
  }

  async sendEmailReminder(payload: any) {
    try {
      const { LOS_URL } = config();
      const url = `${LOS_URL}/admin/sendReminder`;
      const response = await axios.post(url, payload);
      const { data, status, statusText } = response;
      if (status !== 200) {
        throw new HttpException(statusText, status);
      }
      return;
    } catch (error) {
      this.logger.error(
        'Error while sending reminder email',
        `${PaymentManagementCronService.name}#sendEmailReminder`,
        error,
      );
    }
  }
}
