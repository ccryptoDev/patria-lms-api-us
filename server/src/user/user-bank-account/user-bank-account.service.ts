import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { LoanpaymentproService } from '../../loans/payments/loanpaymentpro/loanpaymentpro.service';
// import { AddCardDto } from '../../loans/payments/loanpaymentpro/validation/addCard.dto';
import { AppService } from '../../app.service';
import {
  LoanPaymentProCardToken,
  LoanPaymentProCardTokenDocument,
} from '../../loans/payments/loanpaymentpro/schemas/loanpaymentpro-card-token.schema';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../screen-tracking/screen-tracking.schema';
import { UserDocument } from '../user.schema';
import {
  UserBankAccount,
  UserBankAccountDocument,
} from './user-bank-account.schema';

@Injectable()
export class UserBankAccountService {
  constructor(
    @InjectModel(UserBankAccount.name)
    private readonly userBankAccountModel: mongoose.Model<UserBankAccountDocument>,

    @InjectModel(LoanPaymentProCardToken.name)
    private readonly loanPaymentProCardTokenModel: mongoose.Model<LoanPaymentProCardTokenDocument>,

    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: mongoose.Model<ScreenTrackingDocument>,

    private readonly appService: AppService,
    private readonly loanPaymnetProService: LoanpaymentproService,
  ) { }

  async listUserAccounts(
    userId: string,
    screenTrackingId: string,
  ): Promise<UserBankAccountDocument[]> {
    const screenTracking: ScreenTrackingDocument =
      await this.screenTrackingModel
        .findById(screenTrackingId)
        .populate('user');
    if (!screenTracking) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found.`,
          userId,
        ),
      );
    }
    if (!screenTracking.user) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `User not found for screen tracking id ${screenTrackingId}`,
          userId,
        ),
      );
    }

    const user = screenTracking.user as UserDocument;
    const cards: LoanPaymentProCardTokenDocument[] | null =
      await this.loanPaymentProCardTokenModel.find({
        user,
        paymentType: 'ACH',
      });

    // const userBankData: Array<any> = [];
    const userBankData = JSON.parse(JSON.stringify(cards)) as any[];
    userBankData.forEach((item: any) => {
      Object.assign(item, {
        bankName: item.financialInstitution,
        institutionType: item.accountType,
        screenTracking: screenTrackingId,
        user: userId,
      });
    });
    return userBankData;
    // console.log('cards===', cards);
    // return this.userBankAccountModel.find({
    //   user: userId,
    //   screentracking: screenTrackingId,
    // });
  }

  async createUserBankAccount(userBankData: {
    bankName: string;
    accountHolder: string;
    routingNumber: string;
    accountNumber: string;
    user: string;
    screentracking: string;
  }) {
    const {
      accountHolder,
      accountNumber,
      bankName,
      routingNumber,
      screentracking,
    } = userBankData;

    const screenData = await this.screenTrackingModel
      .findById(screentracking)
      .populate('user');

    if (!screenData) {
      return this.appService.errorHandler(
        404,
        'Application Not Found',
        screentracking,
      );
    }
    const userData = screenData.user as UserDocument;
    const achPayload: any = {
      accountNumber: accountNumber,
      routingNumber: routingNumber,
      accountType: 'CHECKING',
      financialInstitution: bankName,
      nameOnCard: accountHolder,
      billingAddress1: `${userData.state}, ${userData.city}`,
      billingCity: userData.city,
      billingZip: userData.zipCode,
      billingState: userData.state,
      billingFirstName: userData.firstName,
      billingLastName: userData.lastName,
      screenTrackingId: screentracking,
      paymentType: 'ACH',
    };
    return await this.loanPaymnetProService.addAchViaFlexPay(
      achPayload,
      'none',
    );
  }
}
