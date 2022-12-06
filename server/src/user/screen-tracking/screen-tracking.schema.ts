import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { UserDocument } from '../user.schema';
import { PracticeManagementDocument } from '../../loans/practice-management/practice-management.schema';
import { TransUnionsDocument } from '../../loans/underwriting/transunion/schemas/transunions.schema';
import { EsignatureDocument } from '../esignature/esignature.schema';
import { AdminApprovalDocument } from '../admin/approvals/approval.schema';

export type ScreenTrackingDocument = ScreenTracking & Document;
export type OfferData = {
  adjWeightMax: number;
  downPayment: number;
  dtiMax: number;
  dtiMin: number;
  ficoMax: number;
  ficoMin: number;
  financedAmount: number;
  fundingSource: string;
  grade: string;
  loanAmount: number;
  loanId: number;
  maxLoanAmt: number;
  minLoanAmt: number;
  paymentFrequency: string;
  apr: number;
  decimalAmount: number;
  financeCharge: number;
  fullNumberAmount: number;
  interestRate: number;
  monthlyPayment: number;
  postDTI: number;
  term: number;
  totalLoanAmount: number;
  promoApr: number;
  promoDecimalAmount: number;
  promoFinanceCharge: number;
  promoFullNumberAmount: number;
  promoInterestRate: number;
  promoMonthlyPayment: number;
  promoPostDTI: number;
  promoTerm: number;
  promoTotalLoanAmount: number;
  canUsePromo: boolean;
  promoSelected: boolean;
};
export type RulesDetails = {
  approvedRuleMsg: Record<string, any>[];
  declinedRuleMsg: Record<string, any>[];
  ruleData: Record<string, any>[];
  loanApproved: boolean;
  totalAdjWeight: number;
};

@Schema({
  collection: 'screentracking',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class ScreenTracking {
  @Prop()
  id: mongoose.Types.ObjectId;

  @Prop()
  adjRulesWeight: number;

  @Prop()
  applicationReference: string;

  @Prop()
  approvedUpTo: number;

  @Prop()
  creditScore: number;

  @Prop({ type: [Object] })
  declineReasons: Record<string, any>[];

  @Prop()
  deniedMessage: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Esignature' })
  esignature: string | EsignatureDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AdminApproval' })
  adminApproval: string | AdminApprovalDocument;

  @Prop()
  incomeAmount: number; // monthly salary

  @Prop()
  annualIncome: number; // monthly salary

  @Prop()
  updatedIncomeAmount: number; // monthly salary

  @Prop()
  isCompleted: boolean;

  @Prop()
  isMil: boolean;

  @Prop()
  isNoHit: boolean;

  @Prop()
  isOfac: boolean;

  @Prop({ type: String || Number })
  lastLevel: number | string;
  //   enum: [
  //     'apply',
  //     'denied',
  //     'offers',
  //     'contract',
  //     'repayment',
  //     'document-upload',
  //   ],
  // })
  // lastLevel:
  //   | number
  //   | 'apply'
  //   | 'denied'
  //   | 'offers'
  //   | 'sign-contract'
  //   | 'repayment'
  //   | 'document-upload';

  @Prop()
  lockCreditTier: string;

  @Prop()
  lockToLowestTier: boolean;

  @Prop()
  lastlevel: number;

  @Prop()
  requestedAmount: number;

  @Prop()
  requestedLoanAmount: number;

  @Prop({ type: Object })
  offerData: OfferData;

  @Prop({ type: Object })
  selectedOffer: any;

  @Prop({ type: [Object] })
  offers: Record<string, any>[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PracticeManagement' })
  practiceManagement: string | PracticeManagementDocument;

  @Prop()
  preDTIMonthlyAmount: number;

  @Prop()
  preDTIPercentValue: number;

  @Prop()
  skipAutoPay: boolean;

  @Prop()
  source: string;

  @Prop()
  origin: string;

  @Prop({ type: Array || String || mongoose.Schema.Types.ObjectId })
  transUnion: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;

  @Prop({ type: Object })
  rulesDetails: RulesDetails;

  @Prop()
  product: string;

  @Prop()
  isDisbursed: boolean;

  @Prop({ type: Object })
  LDA_emailAlert: {
    time: Date;
    day: number;
  };

  @Prop({ type: Date })
  COAL_emailAlert: Date;

  @Prop()
  updatedAt: Date;
}

export const ScreenTrackingSchema =
  SchemaFactory.createForClass(ScreenTracking);
