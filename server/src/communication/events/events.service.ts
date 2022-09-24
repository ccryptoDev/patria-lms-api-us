import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DatabaseSearchService } from '../../database-search/database-search.service';
import axios, { AxiosResponse } from 'axios';

import { LoggerService } from '../../logger/logger.service';
import { Events, EventsDocument } from './events.schema';
import { LoanSettingsService } from '../../loans/loan-settings/loan-settings.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name)
    private readonly commentsModel: Model<EventsDocument>,
    private readonly databaseSearchService: DatabaseSearchService,
    private readonly logger: LoggerService,
    private readonly loanSettingsService: LoanSettingsService,
  ) {}

  async sendExampleEvent() {
    this.logger.log(
      'Adding comments with params:',
      `${EventsService.name}#addComment`,
    );

    const loanSettings = await this.loanSettingsService.getLoanSettings();

    const requestBody = {
      eventId: '61421b76972efd446d6fb8d8',
      triggerName: 'payment_success',
      userId: '61421b76972efd446d6fb8d8',
      loanId: '61421b76972efd446d6fb8d8',
      eventTimestamp: '2038-01-19 03:14:07',
      eventData: {
        userFirstName: 'Temeka',
        userLastName: 'Adams',
        userSSN: '666603693',
        paymentSchedule: [
          {
            month: 1,
            startBalanceAmount: 5000,
            principalAmount: 226.18,
            interestAmount: 0,
            amount: 226.18,
            remainingPastDueAmount: 0,
            appliedFeesAmount: 0,
            appliedAmount: 226.18,
            appliedPastDueAmount: 0,
            paidPrincipalAmount: 226.18,
            paidInterestAmount: 0,
            lastPaidPrincipalAmount: 0,
            lastPaidInterestAmount: 0,
            lastPaidCount: 0,
            date: '2021-01-29 00:00:00',
            lastPaidDate: '',
            feesAmount: 0,
            paymentType: 'makePayment',
            initiator: 'makePayment',
            pmtRef: 'PMT_1',
            paymentId: '60135f4bbac03d71c12b488a',
            status: 'paid',
          },
          {
            month: 2,
            startBalanceAmount: 4919.65,
            principalAmount: 82.69,
            interestAmount: 143.49,
            amount: 226.18,
            paidPrincipalAmount: 0,
            paidInterestAmount: 0,
            lastPaidPrincipalAmount: 0,
            lastPaidInterestAmount: 0,
            lastPaidCount: 0,
            date: '2021-03-29 00:00:00',
            lastPaidDate: '2021-02-28 00:00:00',
            transaction: 2,
            status: 'opened',
            lateFee: 0,
            lateFeePaid: 0,
            lateFeeUnpaid: 0,
          },
        ],
      },
    };
    try {
      const result = await axios.post(loanSettings.eventsUrl, requestBody, {
        headers: { Authorization: `Bearer ${loanSettings.eventsAuthToken}` },
      });
      return result;
    } catch (error) {
      const result = {
        status: error.response.status,
        message: 'failed',
      };
      return result;
    }
  }

  //   async getAllCommentsByScreenTrackingId(
  //     screenTrackingId: string,
  //     requestId: string,
  //   ) {
  //     this.logger.log(
  //       'Getting all comments by screen tracking id with params:',
  //       `${CommentsService.name}#getAllLogActivities`,
  //       requestId,
  //       { screenTrackingId, getAllCommentsByScreenTrackingDto },
  //     );
  //     const { page, perPage } = getAllCommentsByScreenTrackingDto;
  //     let matchCriteria = { screenTracking: new ObjectId(screenTrackingId) };

  //     if (getAllCommentsByScreenTrackingDto.search) {
  //       const mappedDataFields: {
  //         data: string;
  //         dataType: 'string' | 'currency';
  //       }[] = this.processAllLogActivitiesDataFields();
  //       matchCriteria = this.databaseSearchService.processFiltering(
  //         matchCriteria,
  //         getAllCommentsByScreenTrackingDto.search,
  //         mappedDataFields,
  //       );
  //     }

  //     const response = (
  //       await this.commentsModel.aggregate([
  //         { $match: matchCriteria },
  //         ...this.getPaginationAggregation(page, perPage),
  //       ])
  //     )[0] ?? { rows: [], totalRows: 0 };

  //     response.rows = response.rows.map(
  //       ({ _id, createdAt, createdBy, subject, comment }: any) => {
  //         return {
  //           id: _id,
  //           dateCreated: createdAt,
  //           subject,
  //           createdBy,
  //           comment,
  //         };
  //       },
  //     );
  //     this.logger.log(
  //       'Got comments by screen tracking id:',
  //       `${CommentsService.name}#getAllCommentsByScreenTrackingId`,
  //       requestId,
  //       response,
  //     );

  //     return response;
  //   }
}
