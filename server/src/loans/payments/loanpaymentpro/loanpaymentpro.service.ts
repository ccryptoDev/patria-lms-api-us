import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosRequestConfig } from 'axios';
import { Model } from 'mongoose';

import {
  PaymentManagement,
  PaymentManagementDocument,
} from '../payment-management/payment-management.schema';
import { PaymentDocument } from '../payment.schema';
import {
  LoanPaymentProCardSale,
  LoanPaymentProCardSaleDocument,
} from './schemas/loanpaymentpro-card-sale.schema';
import {
  LoanPaymentProCardToken,
  LoanPaymentProCardTokenDocument,
} from './schemas/loanpaymentpro-card-token.schema';
import { AddCardDto } from './validation/addCard.dto';
import { LoggerService } from '../../../logger/logger.service';
import { AppService } from '../../../app.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../../user/screen-tracking/screen-tracking.schema';
import { UserDocument } from '../../../user/user.schema';
import { ValidateCardDto } from './validation/validateCard.dto';
import { FlexPayService } from '../flex-pay/flex-pay.service';
import { PaymentType } from '../validation/makePayment.dto';

@Injectable()
export class LoanpaymentproService {
  constructor(
    @InjectModel(LoanPaymentProCardToken.name)
    private readonly loanPaymentProCardTokenModel: Model<LoanPaymentProCardTokenDocument>,
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(LoanPaymentProCardSale.name)
    private readonly loanPaymentProCardSaleModel: Model<LoanPaymentProCardSaleDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly flexPayService: FlexPayService,
  ) { }

  /**
   * Add a payment card
   * @param addCardDto AddCardDTO
   * @param requestId unique request id
   */
  async v2PaymentCardsAdd(
    addCardDto: AddCardDto,
    requestId: string,
  ): Promise<LoanPaymentProCardTokenDocument> {
    const { cardCode, expMonth, expYear, screenTrackingId } = addCardDto;
    let errorMessage = '';

    this.logger.log(
      'Adding card with params: ',
      `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
      requestId,
      addCardDto,
    );
    const screenTrackingDocument = await this.screenTrackingModel
      .findById(screenTrackingId)
      .populate('user');
    if (!screenTrackingDocument) {
      errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const user: UserDocument = screenTrackingDocument.user as UserDocument;
    if (!user) {
      errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const cardNumberLastFour = addCardDto.cardNumber.substr(-4);
    const isExistingCard = await this.loanPaymentProCardTokenModel.findOne({
      cardNumberLastFour,
      cardCode,
      expMonth,
      expYear,
      user,
    });
    if (isExistingCard) {
      errorMessage = 'This card has already been added';
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }
    const apiUrl = this.configService.get<string>('v2BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/paymentcards/add`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: addCardDto,
    };
    const { status, data } = await axios(options);

    if (status !== 200 || data.ResponseCode !== '21') {
      const { Status, ResponseCode, Message, TransactionId } = data;
      this.logger.error(
        `Error ${Message}:`,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
        { status, ...data },
      );
      throw new BadRequestException({
        statusCode: 400,
        status: Status,
        message: Message,
        responseCode: ResponseCode,
        transactionId: TransactionId,
        requestId,
      });
    }

    const { CustomerToken, PaymentMethodToken } = data;

    //Search for the user's cards and make the previous cards to "isDefault: false"
    await this.loanPaymentProCardTokenModel.findOneAndUpdate(
      {
        user: user._id,
        isDefault: true,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    );

    const cardToken = await this.loanPaymentProCardTokenModel.create({
      ...addCardDto,
      cardNumberLastFour,
      customerToken: CustomerToken,
      paymentMethodToken: PaymentMethodToken,
      user: user._id,
    } as any);
    this.logger.log(
      'Card added',
      `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
      requestId,
    );

    return cardToken;
  }

  async addCardViaFlexPay(addCardDto: AddCardDto, requestId: string) {
    const {
      cardCode,
      expMonth,
      expYear,
      screenTrackingId,
      nameOnCard,
      cardNumber,
    } = addCardDto;
    addCardDto.paymentType = 'CARD';
    let errorMessage = '';
    const screenTrackingDocument = await this.screenTrackingModel
      .findById(screenTrackingId)
      .populate('user');
    if (!screenTrackingDocument) {
      errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const user: UserDocument = screenTrackingDocument.user as UserDocument;
    if (!user) {
      errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    // const cardNumberLastFour = addCardDto.cardNumber.substr(-4);
    const isExistingCard = await this.loanPaymentProCardTokenModel.findOne({
      cardNumberLastFour: addCardDto.cardNumber,
      cardCode,
      expMonth,
      expYear,
      user,
    });

    if (isExistingCard) {
      errorMessage = 'This card has already been added';
      this.logger.log(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      return null;
    }
    const accessTokenResult = await this.flexPayService.getAccessToken();
    if (!accessTokenResult.ok) {
      throw new BadRequestException(
        this.appService.errorHandler(400, accessTokenResult.error, requestId),
      );
    }
    // const { access_token } = accessTokenResult.data;
    // const tokenizationResult = await this.flexPayService.createTokenization(
    //   screenTrackingDocument,
    //   addCardDto,
    //   access_token,
    // );
    // if (!tokenizationResult.ok) {
    //   const Message = tokenizationResult.error;
    //   throw new BadRequestException({
    //     statusCode: 400,
    //     message: Message,
    //     requestId,
    //   });
    // }
    // const { data } = tokenizationResult;
    // //Search for the user's cards and make the previous cards to "isDefault: false"
    await this.loanPaymentProCardTokenModel.findOneAndUpdate(
      {
        user: user._id,
        isDefault: true,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    );

    const cardToken = await this.loanPaymentProCardTokenModel.create({
      ...addCardDto,
      nameOnCard: nameOnCard || `${user.firstName} ${user.lastName}`,
      cardNumberLastFour: addCardDto.cardNumber,
      cardNumber: cardNumber,
      // customerToken: data.yourReferenceNumber,
      // paymentMethodToken: data.tokenId,
      user: user._id,
    } as any);

    return { message: 'Card has been added successfully', data: cardToken };
  }

  async addAchViaFlexPay(addCardDto: AddCardDto, requestId: string) {
    const { cardCode, routingNumber, accountNumber, screenTrackingId } =
      addCardDto;
    let errorMessage = '';
    const screenTrackingDocument = await this.screenTrackingModel
      .findById(screenTrackingId)
      .populate('user');
    if (!screenTrackingDocument) {
      errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    const user: UserDocument = screenTrackingDocument.user as UserDocument;
    if (!user) {
      errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const isExistingAch = await this.loanPaymentProCardTokenModel.findOne({
      user,
      routingNumber,
      accountNumber,
    });
    if (isExistingAch) {
      errorMessage = 'This ACH has already been added';
      this.logger.error(
        errorMessage,
        `${LoanpaymentproService.name}#v2PaymentCardsAdd`,
        requestId,
      );
      return null;
      // throw new BadRequestException(
      //   this.appService.errorHandler(400, errorMessage, requestId),
      // );
    }
    const accessTokenResult = await this.flexPayService.getAccessToken();
    if (!accessTokenResult.ok) {
      throw new BadRequestException(
        this.appService.errorHandler(400, accessTokenResult.error, requestId),
      );
    }
    const { access_token } = accessTokenResult.data;
    Object.keys(addCardDto).map((item) => {
      if (addCardDto[item] == '') {
        delete addCardDto[item];
      }
    });
    const tokenizationResult = await this.flexPayService.createTokenization(
      screenTrackingDocument,
      addCardDto,
      access_token,
    );
    if (!tokenizationResult.ok) {
      const Message = tokenizationResult.error;
      throw new BadRequestException({
        statusCode: 400,
        message: Message,
        requestId,
      });
    }
    const { data } = tokenizationResult;

    // //Search for the user's cards and make the previous cards to "isDefault: false"
    await this.loanPaymentProCardTokenModel.findOneAndUpdate(
      {
        user: user._id,
        isDefault: true,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    );

    const cardToken = await this.loanPaymentProCardTokenModel.create({
      ...addCardDto,
      routingNumber: routingNumber,
      customerToken: data.yourReferenceNumber,
      paymentMethodToken: data.tokenId,
      user: user._id,
    });
    // const achData = {
    //   user: user,
    //   cardData: cardToken,
    //   screenTracking: screenTrackingDocument,
    // };
    // await this.flexPayService.createAchTransaction(achData, access_token);

    return cardToken;
  }

  async v21PaymentsRefundCard(
    transactionId: string,
    InvoiceId: string,
    Amount: string,
    requestId: string,
  ) {
    this.logger.log(
      'Refund payment with params:',
      `${LoanpaymentproService.name}#v21PaymentsRefundCard`,
      requestId,
      { transactionId, InvoiceId, Amount },
    );

    //v2BaseUrl: 'https://gateway.loanpaymentpro.com/v2',
    //v2/payments/{transaction_id}/refund
    //'Amount' => '5.00',
    //'InvoiceId' => 'LP0003'

    const apiUrl = this.configService.get<string>('v2BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/payments/${transactionId}/refund`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: {
        Amount: Amount,
        InvoiceId: InvoiceId,
      },
    };

    const { data } = await axios(options);
    return data;
  }

  async v21PaymentsReturnRun(
    user: string,
    paymentMethodToken: string,
    amount: number,
    requestId: string,
  ) {
    this.logger.log(
      'Making payment with params:',
      `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
      requestId,
      { user, paymentMethodToken },
    );
    const paymentManagement: PaymentManagementDocument =
      await this.paymentManagementModel.findOne({
        user,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${user}`,
          requestId,
        ),
      );
    }
    const cardDetails: LoanPaymentProCardTokenDocument =
      await this.loanPaymentProCardTokenModel.findOne({
        user,
        paymentMethodToken,
      });
    if (!cardDetails) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Card token not found for user ${user}`,
          requestId,
        ),
      );
    }

    ///payments/customers/{customer_token}/paymentcards/{paymentmethod_token}/disburse
    ///payments/paymentcards/{paymentmethod_token}/disburse
    const apiUrl = this.configService.get<string>('v2BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/payments/paymentcards/${cardDetails.paymentMethodToken}/disburse`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: {
        Amount: '' + amount,
      },
    };

    const { status } = await axios(options);

    return status;
  }

  async v21PaymentsPaymentCardsRun(
    user: string,
    paymentMethodToken: string,
    payment: PaymentDocument,
    requestId: string,
  ): Promise<LoanPaymentProCardSaleDocument> {
    this.logger.log(
      'Making payment with params:',
      `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
      requestId,
      { user, paymentMethodToken, payment },
    );
    const paymentManagement: PaymentManagementDocument =
      await this.paymentManagementModel.findOne({
        user,
      });
    if (!paymentManagement) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Payment management not found for user id ${user}`,
          requestId,
        ),
      );
    }
    const cardDetails: LoanPaymentProCardTokenDocument =
      await this.loanPaymentProCardTokenModel.findOne({
        user,
        paymentMethodToken,
      });
    if (!cardDetails) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Card token not found for user ${user}`,
          requestId,
        ),
      );
    }

    const apiUrl = this.configService.get<string>('v21BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/payments/paymentcards/${cardDetails.paymentMethodToken}/run`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: {
        Amount: '' + payment.amount,
        InvoiceId: payment.paymentReference,
      },
    };

    const { status, data } = await axios(options);
    const { Status, ResponseCode, Message, AuthCode, TransactionId } = data;
    const paymentCardSaleObj = {
      user,
      payment: payment._id,
      cardToken: cardDetails._id,
      status: Status,
      message: Message,
      responseCode: ResponseCode,
      authCode: AuthCode,
      transactionId: TransactionId,
      paymentRequest: {
        amount: payment.amount,
        invoiceId: payment.paymentReference,
      },
      paymentResponse: data,
    };
    if (status !== 200 || ResponseCode !== '29') {
      await this.loanPaymentProCardSaleModel.create(paymentCardSaleObj);
      this.logger.error(
        `Error ${Message}:`,
        `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
        requestId,
        { status, data },
      );
      throw new BadRequestException({
        statusCode: 400,
        status: Status,
        message: Message,
        responseCode: ResponseCode,
        transactionId: TransactionId,
        requestId,
      });
    }

    const cardSale = await this.loanPaymentProCardSaleModel.create(
      paymentCardSaleObj,
    );
    this.logger.log(
      'Payment made:',
      `${LoanpaymentproService.name}#v21PaymentsPaymentCardsRun`,
      requestId,
      cardSale,
    );

    return cardSale;
  }

  async getUserCards(
    screenTrackingId: string,
    requestId: string,
    bankAccount = false,
  ) {
    const screenTracking: ScreenTrackingDocument =
      await this.screenTrackingModel
        .findById(screenTrackingId)
        .populate('user');
    if (!screenTracking) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found.`,
          requestId,
        ),
      );
    }
    if (!screenTracking.user) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `User not found for screen tracking id ${screenTrackingId}`,
          requestId,
        ),
      );
    }

    const user = screenTracking.user as UserDocument;
    const query: any = { user };
    if (!bankAccount) query.paymentType = 'CARD';
    const cards: LoanPaymentProCardTokenDocument[] | null =
      await this.loanPaymentProCardTokenModel.find(query);
    // if (!cards || cards.length <= 0) {
    //   throw new NotFoundException(
    //     this.appService.errorHandler(
    //       404,
    //       `No cards found for user id ${user._id}`,
    //       requestId,
    //     ),
    //   );
    // }

    const response = cards.map((card) => {
      const { paymentType, expMonth, expYear } = card;
      return {
        paymentMethodToken: card.paymentMethodToken,
        cardNumberLastFour: card.cardNumberLastFour,
        updatedAt: card.updatedAt,
        firstName: card.billingFirstName,
        lastName: card.billingLastName,
        nameOnCard: card.nameOnCard,
        cardExpiration:
          paymentType === PaymentType.CARD ? `${expMonth}/${expYear}` : 'N/A',
        isDefault: card.isDefault,
        paymentType: card.paymentType,
        routingNumber: card.routingNumber,
        financialInstitution: card?.financialInstitution,
        accountType: card?.accountType,
        accountNumber: card.accountNumber,
        _id: card._id,
      };
    });

    return response;
  }

  async validateCard(validateCardDto: ValidateCardDto, requestId: string) {
    this.logger.log(
      'Validating card with params:',
      `${LoanpaymentproService.name}#validateCard`,
      requestId,
      validateCardDto,
    );
    const { cardCode, cardNumber, expMonth, expYear } = validateCardDto;
    const apiUrl = this.configService.get<string>('v21BaseUrl');
    const acquiringKey = this.configService.get<string>('acquiringKey');
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${apiUrl}/paymentcards/validate`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        TransactionKey: acquiringKey,
      },
      data: {
        CardCode: cardCode,
        CardNumber: cardNumber,
        ExpMonth: expMonth,
        expYear: expYear,
      },
    };

    const { data } = await axios(options);
    this.logger.log(
      'Card validation result:',
      `${LoanpaymentproService.name}#validateCard`,
      requestId,
      data,
    );
    return data;
  }

  async updateCard(paymentId: string, requestId: string) {
    //Extract user_id from card
    const card = await this.loanPaymentProCardTokenModel.findOne({
      _id: paymentId,
    });
    const user_id = card.user;
    //Search for the user's cards and make the previous cards to "isDefault: false"
    const data = await this.loanPaymentProCardTokenModel.findOneAndUpdate(
      {
        user: user_id,
        isDefault: true,
      },
      {
        // $set: {
        isDefault: false,
        // },
      }
    );

    //set Default Card
    const cardToken = await this.loanPaymentProCardTokenModel.findOneAndUpdate(
      {
        _id: paymentId,
      },
      {
        // $set: {
        isDefault: true,
        // },
      },
    );
  }

  async testingPaymentService(screenTrackingId: string): Promise<any> {
    const screenTrackingDocument = await this.screenTrackingModel
      .findById(screenTrackingId)
      .populate('user');
    const cardDetails = {
      cardNumber: '4242424242424242',
      expMonth: '05',
      expYear: '2025',
      cardCode: '123',
    };
    const { data, ok } = await this.flexPayService.getAccessToken();
    if (!ok) {
      return { error: 'Token Not Fetched' };
    }
    const res = await this.flexPayService.createTokenization(
      screenTrackingDocument,
      cardDetails,
      data.access_token,
    );
    return res;
  }

  async removeAchOrCard(context: {
    paymentType: 'ACH' | 'CARD';
    paymentId: string;
    screenTrackingId: string;
  }) {
    const { paymentId, paymentType, screenTrackingId } = context;
    const screenData = await this.screenTrackingModel.findById(
      screenTrackingId,
    );
    console.log('screenTrackingId===', screenTrackingId);
    if (!screenData) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found.`,
          paymentId,
        ),
      );
    }
    const loanData = await this.loanPaymentProCardTokenModel.findById(
      paymentId,
    );
    const data = await this.loanPaymentProCardTokenModel.remove({
      _id: paymentId,
    });

    return {
      data: loanData,
      screenData,
    };
  }
}
