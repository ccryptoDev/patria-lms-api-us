// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import moment from 'moment';
// import { Model } from 'mongoose';
// import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';
// import { LoggerService } from '../../logger/logger.service';
// import { LoanSettingsService } from '../loan-settings/loan-settings.service';
// import {
//   PaymentManagement,
//   PaymentManagementDocument,
// } from '../payments/payment-management/payment-management.schema';
// import { IPaymentScheduleItem } from '../payments/payment-management/payment-schedule-item.interface';

// @Injectable()
// export class CollectionCronService {
//   PaymentManagementModel: any;
//   constructor(
//     private readonly logger: LoggerService,
//     private readonly loanSettingsService: LoanSettingsService,
//     @InjectModel(PaymentManagement.name)
//     private readonly paymentManagementModel: Model<PaymentManagementDocument>,
//   ) {}
//   //EVERY_MINUTE
//   @Cron(CronExpression.EVERY_MINUTE)
//   async checkAndProcessCollectionContracts() {
//     console.log('Collections Cron Service - check promise to pay called');
//     const paymentManagements:
//       | PaymentManagementDocument[]
//       | null = await this.paymentManagementModel.find({
//       collectionsAccountStatus: 'PROMISE_TO_PAY',
//     });
//     console.log(
//       'Collections Cron Service - check promise to pay called\n\n\n' +
//         JSON.stringify(paymentManagements),
//     );
//     if (paymentManagements && paymentManagements.length > 0) {
//       for (const paymentManagement of paymentManagements) {
//         this.checkPromiseToPay(paymentManagement);
//       }
//     }
//   }

//   async checkPromiseToPay(paymentManagement: PaymentManagementDocument) {
//     const contactScheduleMoment = moment(
//       paymentManagement.contactScheduleReminderDate,
//     );
//     if (moment().diff(contactScheduleMoment) >= 0) {
//       console.log(
//         `Collections Cron Service - check promise to pay: Moving ${paymentManagement.id} to contact needed status`,
//       );
//       paymentManagement.collectionsAccountStatus =
//         'PROMISE_TO_PAY_CONTACT_NEEDED';
//       // add logactivity
//     }
//   }

//   //   @Cron(CronExpression.EVERY_MINUTE)
//   //   async moveCollections() {
//   //     this.logger.log(
//   //       'Running Collections in and out cron',
//   //       `${CollectionCronService.name}#moveCollections`,
//   //     );

//   //     this.logger.log(
//   //       'Running moveCollections cron',
//   //       `${CollectionCronService.name}#delinquencyCron`,
//   //     );
//   //     let paymentManagementId = '';

//   //     const loanSettings = await this.loanSettingsService.getLoanSettings();
//   //     const today: Date = moment().startOf('day').toDate();
//   //     const lateFeeThreshold: Date = moment(today)
//   //       .subtract(loanSettings.lateFeeGracePeriod, 'day')
//   //       .startOf('day')
//   //       .toDate();

//   //     try {
//   //       // check for payments due today
//   //       const paymentManagements:
//   //         | PaymentManagementDocument[]
//   //         | null = await this.PaymentManagementModel.find({
//   //         status: {
//   //           $in: [
//   //             'in-repayment prime',
//   //             'in-repayment non-prime',
//   //             'in-repayment delinquent1',
//   //             'in-repayment delinquent2',
//   //             'in-repayment delinquent3',
//   //             'in-repayment delinquent4',
//   //           ],
//   //         },
//   //       }).populate('screenTracking');
//   //       if (!paymentManagements || paymentManagements.length <= 0) {
//   //         this.logger.log(
//   //           'No active loans found',
//   //           `${CollectionCronService.name}#delinquencyCron`,
//   //         );
//   //         return;
//   //       }

//   //       for (const paymentManagement of paymentManagements) {
//   //         try {
//   //           paymentManagementId = paymentManagement._id;
//   //           const screenTracking: ScreenTrackingDocument = paymentManagement.screenTracking as ScreenTrackingDocument;
//   //           // find next available payment schedule items that  before today's date
//   //           const paymentScheduleItems: IPaymentScheduleItem[] = paymentManagement.paymentSchedule.filter(
//   //             (scheduleItem) =>
//   //               moment(scheduleItem.date).startOf('day').isBefore(today) &&
//   //               scheduleItem.status === 'opened',
//   //           );

//   //           // If there is no late payments in the schedule
//   //           if (!paymentScheduleItems || paymentScheduleItems.length <= 0) {
//   //             await this.PaymentManagementModel.updateOne(
//   //               { _id: paymentManagement._id },
//   //               {
//   //                 status:
//   //                   screenTracking.offerData.downPayment == 0
//   //                     ? 'in-repayment prime'
//   //                     : 'in-repayment non-prime',
//   //               },
//   //             );
//   //             continue;
//   //           } else {
//   //             const furthestLatePayment = paymentScheduleItems[0];
//   //             const collectionStatus: PaymentManagementDocument['collectionAssignStatus'] = await this.determineCollectionTier(
//   //               moment(today).diff(furthestLatePayment.date, 'day'),
//   //               loanSettings.delinquencyPeriod,
//   //             );
//   //             let collectionAccountStatus: PaymentManagementDocument['collectionsAccountStatus'] =
//   //               '';
//   //             if (collectionStatus != '') {
//   //               collectionAccountStatus = 'WAITING_TO_COLLECT';
//   //             }
//   //             await this.PaymentManagementModel.updateOne(
//   //               { _id: paymentManagement._id },
//   //               {
//   //                 collectionAssignStatus: collectionStatus,
//   //                 collectionsAccountStatus: collectionAccountStatus,
//   //               },
//   //             );
//   //           }

//   //           this.logger.log(
//   //             `Processing moveCollections status for payment management id ${paymentManagementId}`,
//   //             `${CollectionCronService.name}#moveCollectionsCron`,
//   //           );
//   //         } catch (error) {
//   //           this.logger.error(
//   //             `Could not process automatic payment for payment management id ${paymentManagementId}`,
//   //             `${CollectionCronService.name}#delinquencyCron`,
//   //             undefined,
//   //             error,
//   //           );
//   //         }
//   //       }
//   //       this.logger.log(
//   //         'Ran moveCollections cron',
//   //         `${CollectionCronService.name}#moveCollectionsCron`,
//   //       );
//   //     } catch (error) {
//   //       this.logger.log(
//   //         `Internal server error`,
//   //         `${CollectionCronService.name}#moveCollectionsCron`,
//   //         undefined,
//   //         error,
//   //       );
//   //     }
//   //   }

//   async determineCollectionTier(
//     days: number,
//     dPeriod: number,
//   ): Promise<PaymentManagementDocument['collectionAssignStatus']> {
//     if (days >= dPeriod) {
//       return 'Unassigned';
//     } else {
//       return '';
//     }
//   }
// }
