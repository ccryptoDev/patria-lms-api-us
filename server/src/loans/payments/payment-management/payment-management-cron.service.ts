import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';

import { LoggerService } from '../../../logger/logger.service';
import { LoanSettingsService } from '../../loan-settings/loan-settings.service';
import {
  PaymentManagement,
  PaymentManagementDocument,
} from './payment-management.schema';
import { IPaymentScheduleItem } from './payment-schedule-item.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';
import { PaymentService } from '../../payments/payment.service';
import { MandrillService } from '../../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../../nunjucks-compiler/nunjucks-compiler.service';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../../user/user.schema';
import { Roles, RolesDocument } from '../../../user/roles/roles.schema';
import { Admin, AdminDocument } from '../../../user/admin/admin.schema';
import { FlexPayService } from '../flex-pay/flex-pay.service';

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
      const paymentManagements: PaymentManagementDocument[] =
        await this.PaymentManagementModel.find({ promoStatus: 'available' });
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

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
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
      const paymentManagements: PaymentManagementDocument[] | null =
        await this.PaymentManagementModel.find({
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
      const delinquentArray = [];
      for (const paymentManagement of paymentManagements) {
        try {
          paymentManagementId = paymentManagement._id;
          const screenTracking: ScreenTrackingDocument =
            paymentManagement.screenTracking as ScreenTrackingDocument;
          // find next available payment schedule items that  before today's date
          const paymentScheduleItems: IPaymentScheduleItem[] =
            paymentManagement.paymentSchedule.filter(
              (scheduleItem) =>
                moment(scheduleItem.date).startOf('day').isBefore(today) &&
                scheduleItem.status === 'opened',
            );
          // If there is no late payments in the schedule
          if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
            await this.PaymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                status:
                  screenTracking.offerData.downPayment == 0
                    ? 'in-repayment prime'
                    : 'in-repayment non-prime',
              },
            );
            continue;
          } else {
            const furthestLatePayment = paymentScheduleItems[0];
            const updateStatus: PaymentManagementDocument['status'] =
              await this.determineDelinquentTier(
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

          // for (const paymentScheduleItem of paymentScheduleItems) {
          //   if (
          //     moment(paymentScheduleItem.date)
          //       .startOf('day')
          //       .isSameOrBefore(lateFeeThreshold)
          //   ) {
          //     if (paymentScheduleItem.fees == 0) {
          //       paymentScheduleItem.fees += loanSettings.lateFee;
          //     }
          //   }

          //   const updatedPaymentManagement = {
          //     paymentSchedule: paymentManagement.paymentSchedule,
          //   };

          //   await this.PaymentManagementModel.updateOne(
          //     { _id: paymentManagement._id },
          //     updatedPaymentManagement,
          //   );
          // }
          const newPaymentManagement: PaymentManagementDocument | null =
            await this.PaymentManagementModel.findOne({
              screenTracking,
            });
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

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkAchTransactionStatus() {
    try {
      await this.flexPayService.getAchTransactionStatus();
    } catch (error) {
      this.logger.error('ERROR::checkAchTransactionStatus:', error);
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
      const paymentManagements: PaymentManagementDocument[] | null =
        await this.PaymentManagementModel.find({
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
          const screenTracking: ScreenTrackingDocument =
            paymentManagement.screenTracking as ScreenTrackingDocument;
          // find next available payment schedule items that  before today's date
          const paymentScheduleItems: IPaymentScheduleItem[] =
            paymentManagement.paymentSchedule.filter(
              (scheduleItem) =>
                moment(scheduleItem.date).startOf('day').isBefore(today) &&
                scheduleItem.status === 'opened',
            );

          // If there is no late payments in the schedule
          if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
            await this.PaymentManagementModel.updateOne(
              { _id: paymentManagement._id },
              {
                status:
                  screenTracking.offerData.downPayment == 0
                    ? 'in-repayment prime'
                    : 'in-repayment non-prime',
              },
            );
            continue;
          } else {
            const furthestLatePayment = paymentScheduleItems[0];
            const collectionStatus: PaymentManagementDocument['collectionAssignStatus'] =
              await this.determineCollectionTier(
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
}
