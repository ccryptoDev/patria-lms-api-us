import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerService } from '../../../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import {
  DisbursePayload,
  FlexReturnPayload,
  FlexTransactionCommit,
} from './flex-pay.dto';
import { UserDocument } from 'src/user/user.schema';
import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { AddCardDto } from '../loanpaymentpro/validation/addCard.dto';
import { Model, Types } from 'mongoose';
import { LoanPaymentProCardToken } from '../loanpaymentpro/schemas/loanpaymentpro-card-token.schema';
import {
  FlexTransactionReport,
  FlexTransactionReportDocument,
  FlexTransactionReportSchema,
  TransactionStatus,
} from './flex.schema';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';
import { PaymentType } from '../validation/makePayment.dto';

@Injectable()
export class FlexPayService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @InjectModel(FlexTransactionReport.name)
    private readonly flexPayTransaction: Model<FlexTransactionReportDocument>,
  ) {}

  initReturnPayload(): FlexReturnPayload {
    return {
      data: null,
      ok: false,
      error: null,
    };
  }

  async getAccessToken(): Promise<FlexReturnPayload> {
    const result: FlexReturnPayload = this.initReturnPayload();
    try {
      const flexTokenUrl = this.configService.get<any>('ACCESS_TOKEN_URL');
      const granType = this.configService.get<any>('grant_type');
      const password = this.configService.get<any>('flex_password');
      const username = this.configService.get<any>('flex_username');
      const clientId = this.configService.get<any>('flex_client_id');
      const clientSecret = this.configService.get<any>('flex_client_secret');

      const formDataPayload = new FormData();
      formDataPayload.append('grant_type', granType);
      formDataPayload.append('username', username);
      formDataPayload.append('password', password);
      formDataPayload.append('client_id', clientId);
      formDataPayload.append('client_secret', clientSecret);

      const options: AxiosRequestConfig = {
        method: 'POST',
        url: `${flexTokenUrl}`,
        headers: {
          Accept: 'application/json',
          // 'Content-Type': 'application/json',
        },
        data: formDataPayload,
      };
      const { status, data } = await axios(options);
      result.ok = true;
      result.data = data;
    } catch (error) {
      result.error = error?.response?.data;
      console.log('GET_ACCESS_TOKEN::Error', error);
    } finally {
      return result;
    }
  }

  async createTokenization(
    screenTracking,
    cardDetails,
    accessToken: string,
  ): Promise<FlexReturnPayload> {
    const result: FlexReturnPayload = this.initReturnPayload();
    try {
      const {
        cardNumber,
        expMonth,
        expYear,
        cardCode,
        accountNumber,
        financialInstitution,
        routingNumber,
        accountType,
      } = cardDetails;

      const user: UserDocument = screenTracking?.user;
      const applicationReference = screenTracking?.applicationReference?.replace(
        /_/g,
        '',
      );
      const payload = {
        yourReferenceNumber: applicationReference,
        yourSubClientId: screenTracking?._id,
        piiData: {
          companyName: 'PatriaLending',
          email: user.email,
          firstSignerFirstName: user?.firstName?.replace(/[^a-zA-Z ]/g, ''),
          firstSignerLastName: user?.lastName?.replace(/[^\w\s]/gi, ''),
          city: user.city,
          state: user.state,
          zip: user.zipCode,
          cellPhone: user.phones[0].phone,
          dob: user.dateOfBirth,
          ssn: user.ssnNumber,
          address1: `${user.city} ${user.state} ${user.zipCode}`,
        },
      };
      if (cardDetails.paymentType === 'CARD') {
        payload['cardData'] = {
          pan: cardNumber,
          expirationDate: `${expMonth}/20${expYear}`,
          cvv: cardCode,
        };
      } else {
        const flexAccountType = accountType.toLowerCase();
        payload['bankAccountData'] = {
          bankRoutingNumber: routingNumber,
          bankAccountNumber: accountNumber,
          bankAccountType:
            flexAccountType === 'saving'
              ? `${flexAccountType}s`
              : flexAccountType,
        };
      }
      const flexTokenUrl = this.configService.get<any>('FLEX_TOKEN_URL');
      const options: AxiosRequestConfig = {
        method: 'POST',
        url: `${flexTokenUrl}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: payload,
      };
      const { status, data } = await axios(options);
      if (status !== 200) {
        throw new HttpException('Partial Service Outage', 500);
      }
      result.data = data;
      result.ok = true;
    } catch (error) {
      console.log('============data', error);

      result.error = error?.response?.data;
    } finally {
      return result;
    }
  }

  async createAchTransaction(achData, requestId): Promise<FlexReturnPayload> {
    const result: FlexReturnPayload = this.initReturnPayload();
    const { user, screenTracking, cardData, amount } = achData;
    try {
      const accessTokenResult = await this.getAccessToken();
      this.logger.log(
        JSON.stringify(accessTokenResult, null, 4),
        'createAchTransaction#tokenResult',
        requestId,
      );

      if (!accessTokenResult.ok) {
        throw new HttpException('Authentication Failed', 400);
      }
      const { access_token } = accessTokenResult.data;
      const applicationReference = screenTracking?.applicationReference
        ?.replace(/_/g, '')
        .padStart(16, '0');
      // const flexAccountType = cardData?.accountType?.toLowerCase();

      const payload = {
        yourReferenceNumber: applicationReference,
        firstSignerFirstName: user?.firstName?.replace(/[^a-zA-Z ]/g, ''),
        firstSignerLastName: user?.lastName?.replace(/[^\w\s]/gi, ''),
        address1: `${user.city} ${user.state} ${user.zipCode}`,
        address2: '',
        city: user.city,
        state: user.state,
        zip: user.zipCode,
        bankRoutingNumber: cardData?.routingNumber || '999999995',
        bankAccountNumber: cardData?.accountNumber,
        amount: amount,
        achTransactionCode: 27,
      };

      const flexTokenUrl = this.configService.get<any>('FLEX_ACH_URL');
      const options: AxiosRequestConfig = {
        method: 'POST',
        url: `${flexTokenUrl}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        data: payload,
      };

      this.logger.log(
        JSON.stringify(options, null, 4),
        'createAchTransaction#options',
        requestId,
      );

      const { status, data } = await axios(options);
      if (status !== 200) {
        throw new HttpException('Partial Service Outage', 500);
      }

      this.logger.log(
        JSON.stringify(data, null, 4),
        'createAchTransaction#data',
        requestId,
      );

      if (!['W', 'S'].includes(data?.transaction?.itemStatus)) {
        throw new HttpException('FlexPay payment rejected', 400);
      }

      const commitDataContext: FlexTransactionCommit = {
        userData: {
          userId: user._id,
          screenTrackingId: screenTracking._id,
          paymentType: 'ACH',
        },
        transaction: data?.transaction,
      };
      // should be loop if failed or trigger email

      this.logger.log(
        JSON.stringify(commitDataContext, null, 4),
        'createAchTransaction#commitDataContext',
        requestId,
      );

      const commitResponse = await this.commitTransactionData(
        commitDataContext,
      );

      this.logger.log(
        JSON.stringify(commitResponse, null, 4),
        'createAchTransaction#commitResponse',
        requestId,
      );
      result.ok = true;
      result.data = commitResponse;
    } catch (error) {
      result.error = error?.response?.data;
      this.logger.error(error, 'createAchTransaction#error', requestId);
    } finally {
      return result;
    }
  }

  // to make a payment from card via flex pay
  async cardInstantTransaction(
    context: LoanPaymentProCardToken,
    screenTracking: ScreenTrackingDocument,
    amount: number,
    requestId,
  ) {
    const result: FlexReturnPayload = this.initReturnPayload();
    try {
      const tokenResult = await this.getAccessToken();
      this.logger.log(
        JSON.stringify(tokenResult, null, 4),
        'cardInstantTransaction#tokenResult',
        requestId,
      );

      if (!tokenResult.ok) {
        throw new HttpException('Token Not Found', 404);
      }
      const { access_token } = tokenResult.data;

      const flexTokenUrl = this.configService.get<any>(
        'FLEX_INSTANT_TRANSACTION',
      );
      const referenceNumber = screenTracking?.applicationReference
        ?.replace(/_/g, '')
        .padStart(16, '0');

      const payload = {
        // tokenId: context.paymentMethodToken,
        yourSubClientId: String(screenTracking._id),
        amount: amount,
        yourReferenceNumber: referenceNumber,
        nameOnCard: context.nameOnCard,
        cardNumber: context.cardNumberLastFour,
        cardExpiration: `${context.expMonth}/20${context.expYear}`,
      };

      const options: AxiosRequestConfig = {
        method: 'POST',
        url: `${flexTokenUrl}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        data: payload,
      };

      this.logger.log(
        JSON.stringify(options, null, 4),
        'cardInstantTransaction#options',
        requestId,
      );

      const { status, data } = await axios(options);

      this.logger.log(
        JSON.stringify(data, null, 4),
        'cardInstantTransaction#data',
        requestId,
      );

      if (status !== 200) {
        throw new HttpException('Partial Service Outage', 500);
      }
      const commitDataContext: FlexTransactionCommit = {
        userData: {
          userId: screenTracking.user,
          screenTrackingId: screenTracking._id,
          paymentType: 'CARD',
        },
        transaction: data?.transaction,
      };
      // should be loop if failed or trigger email

      this.logger.log(
        JSON.stringify(commitDataContext, null, 4),
        'cardInstantTransaction#commitDataContext',
        requestId,
      );
      const commitResponse = await this.commitTransactionData(
        commitDataContext,
      );
      result.data = commitResponse;
      this.logger.log(
        JSON.stringify(commitResponse, null, 4),
        'cardInstantTransaction#commitResponse',
        requestId,
      );
      result.ok = true;
    } catch (error) {
      this.logger.error(error, 'cardInstantTransaction#error', requestId);
      result.error = error;
    } finally { 
      return result;
    }
  }

  async commitTransactionData(flexResponse: FlexTransactionCommit) {
    // const result: FlexReturnPayload = this.initReturnPayload();
    const { transaction, userData } = flexResponse;
    const countDocuments = await this.flexPayTransaction.countDocuments({
      user: userData.userId,
    });
    const newTransactionId = `FLEX_${(countDocuments || 0) + 1}`;
    const payload = {
      transaction: transaction,
      user: userData.userId,
      screenTracking: userData.screenTrackingId,
      paymentType: userData.paymentType,
      amount: transaction.amount,
      transactionId: newTransactionId,
      itemStatusDescription: '',
    } as any;
    if (userData.paymentType === 'ACH') {
      payload.itemStatusDescription = transaction.itemStatusDescription;
    } else {
      payload['status'] =
        transaction.status === 'Failed'
          ? TransactionStatus.FAILED
          : TransactionStatus.APPROVED;
      payload.itemStatusDescription = transaction.statusDescription;
    }
    const data = await this.flexPayTransaction.create(payload);
    return data;
  }

  async getAchTransactionStatus() {
    try {
      const achData = await this.flexPayTransaction.find({
        status: TransactionStatus.PENDING,
        paymentType: PaymentType.ACH,
      });
      if (achData.length === 0) {
        throw new HttpException('ACH transaction not found', 404);
      }

      const accessTokenResult = await this.getAccessToken();
      if (!accessTokenResult.ok) {
        throw new HttpException('Authentication Failed', 400);
      }
      const { access_token } = accessTokenResult.data;

      const AchStatusUrl = this.configService.get<any>('FLEX_GET_ACH_STATUS');

      for (let i = 0; i < achData.length; i++) {
        const achTransaction = achData[i];

        const options: AxiosRequestConfig = {
          method: 'GET',
          url: `${AchStatusUrl}?AchItemId=${achTransaction.transaction?.achItemId}`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        };
        const { status, data } = await axios(options);
        if (status !== 200 && status !== 201) {
          continue;
        }
        const { transactions } = data;
        if (!transactions || transactions?.length === 0) {
          throw new HttpException('Transaction Not Found', 404);
        }

        if (transactions[0]?.itemStatus === 'S') {
          this.logger.log(
            'UPDATE::CRON:getAchTransactionStatus:',
            `userId: ${achTransaction.user} ACH approved`,
          );
          await this.flexPayTransaction.updateOne(
            { _id: achTransaction._id },
            { status: TransactionStatus.APPROVED },
          );
        }
      }
    } catch (error) {
      this.logger.error('ERROR::CRON:getAchTransactionStatus:', error);
      return error;
    }
  }

  // to disburse or credit payment achTransactionCode=22
  async disbursePaymentViaAch(achData: DisbursePayload, requestId) {
    const result: FlexReturnPayload = this.initReturnPayload();
    try {
      const { user, bankData, amount, screenTracking: screenData } = achData;

      const applicationReference = screenData?.applicationReference
        ?.replace(/_/g, '')
        .padStart(16, '0');

      const accessTokenResult = await this.getAccessToken();

      this.logger.log(
        JSON.stringify(accessTokenResult, null, 4),
        'disbursePaymentViaAch#accessTokenResult',
        requestId,
      );

      if (!accessTokenResult.ok) {
        throw new HttpException('Authentication Failed', 400);
      }
      const { access_token } = accessTokenResult.data;

      const payload = {
        firstSignerFirstName: user?.firstName?.replace(/[^a-zA-Z ]/g, ''),
        firstSignerLastName: user?.lastName?.replace(/[^\w\s]/gi, ''),
        address1: user.street,
        city: user.city,
        state: user.state,
        zip: user.zipCode,
        email: user.email,
        cellPhone: user?.phoneNumber,
        dob: user.dateOfBirth,
        ssn: user.ssnNumber,
        yourSubClientId: screenData?._id,
        yourReferenceNumber: applicationReference,
        bankRoutingNumber: bankData?.routingNumber,
        bankAccountNumber: bankData?.accountNumber,
        amount: amount,
        achTransactionCode: 22, // 22 CODE IS USED FOR CREDIT OPERATION
        achAccountType: 'Checking',
        // achTransactionType: 'string',
        // achTransactionSubType: 'string',
        achPaymentTypeCode: 'st',
        achCheckNumber: 0,
        achIdentificationNumber: 'string',
        achCompanyEntryDescription: 'n/a',
        achCompanyDiscretionaryData: 'string',
        achTransactionDiscretionaryData: 'st',
        // achAddendaText: 'string',
        sameDayAchRequested: true,
        sendDate: new Date(),
        achEffectiveDate: new Date(),
      };
      const flexTokenUrl = this.configService.get<any>('FLEX_ACH_URL');
      const options: AxiosRequestConfig = {
        method: 'POST',
        url: `${flexTokenUrl}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        data: payload,
      };

      this.logger.log(
        JSON.stringify(options, null, 4),
        'disbursePaymentViaAch#options',
        requestId,
      );
      const { status, data } = await axios(options);

      this.logger.log(
        JSON.stringify(data, null, 4),
        'disbursePaymentViaAch#data',
        requestId,
      );

      if (status !== 200) {
        throw new HttpException('Partial Service Outage', 500);
      }
      result.ok = true;
      result.data = data;
    } catch (error) {
      this.logger.error(error, 'disbursePaymentViaAch#error', requestId);
      result.error = error;
    } finally {
      return result;
    }
  }
}
