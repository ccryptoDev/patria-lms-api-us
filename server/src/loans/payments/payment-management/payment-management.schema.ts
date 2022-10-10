import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { PracticeManagementDocument } from '../../../loans/practice-management/practice-management.schema';
import { ScreenTrackingDocument } from '../../../user/screen-tracking/screen-tracking.schema';
import { UserDocument } from '../../../user/user.schema';
import { AdminDocument } from '../../../user/admin/admin.schema';
import { IPaymentScheduleItem } from './payment-schedule-item.interface';
import { promiseToPayItem } from './promise-to-pay-item.interface';
import { ILedger } from '../../ledger/ledger.interface';

export enum LOAN_STATUS {
  APPROVED = 'approved',
  DENIED = 'denied',
  EXPIRED = 'expired',
  NON_PRIME = 'in-repayment non-prime',
  PRIME = 'in-repayment prime',
  REPAYMENT = 'in-repayment',
  DELIQUENT1 = 'in-repayment delinquent1',
  DELIQUENT2 = 'in-repayment delinquent2',
  DELIQUENT3 = 'in-repayment delinquent3',
  DELIQUENT4 = 'in-repayment delinquent4',
  PAID = 'paid',
  MANUAL_REVIEW = 'manual-review',
  PENDING = 'pending',
  CLOSED = 'closed',
}

export type PaymentManagementDocument = PaymentManagement & Document;

@Schema({
  collection: 'paymentmanagement',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class PaymentManagement {
  @Prop()
  apr: number;

  @Prop()
  canRunAutomaticPayment: boolean;

  @Prop()
  currentPaymentAmount: number;

  @Prop()
  initialPaymentSchedule: IPaymentScheduleItem[];

  @Prop()
  interestApplied: number;

  @Prop()
  loanReference: string;

  @Prop()
  loanStartDate: Date;

  @Prop()
  loanTermCount: number;

  @Prop()
  maturityDate: Date;

  @Prop()
  minimumPaymentAmount: number;

  @Prop()
  nextPaymentSchedule: Date;

  @Prop()
  paymentSchedule: IPaymentScheduleItem[];

  @Prop()
  payOffAmount: number; // same as promo payoff during the promo term

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practiceManagement: string | PracticeManagementDocument;

  @Prop()
  principalAmount: number;

  @Prop()
  promoPaymentAmount: number;

  @Prop()
  promoSelected: boolean;

  @Prop({ type: String, enum: ['available', 'unavailable'] })
  promoStatus: 'available' | 'unavailable';

  @Prop()
  promoTermCount: number;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screenTracking: string | ScreenTrackingDocument;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(LOAN_STATUS),
  })
  status:
    | 'approved'
    | 'denied'
    | 'expired'
    | 'in-repayment non-prime'
    | 'in-repayment prime'
    | 'in-repayment'
    | 'in-repayment delinquent1'
    | 'in-repayment delinquent2'
    | 'in-repayment delinquent3'
    | 'in-repayment delinquent4'
    | 'paid'
    | 'pending'
    | 'manual-review'
    | 'closed';

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string | UserDocument;

  @Prop()
  collectionAssignStatus: string;

  @Prop()
  collectionsAccountStatus: string;

  @Prop()
  delinquentDays: number;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  })
  collectionAssignedUser: string | AdminDocument;

  @Prop()
  promiseToPay: promiseToPayItem[];

  @Prop({
    required: false,
  })
  collectionAssignedEmail: string;
}

export const PaymentManagementSchema =
  SchemaFactory.createForClass(PaymentManagement);

export const collectionAssignStatusEnum = {
  ASSIGNED: 'Assigned',
  UNASSIGNED: 'Unassigned',
  REASSIGNED: 'Re-assigned',
};

export const collectionsAccountStatusEnum = {
  WAITING_TO_COLLECT: 'WAITING_TO_COLLECT',
  PENDING_COLLECTIONS: 'PENDING_COLLECTIONS',
  CHARGEOFF: 'CHARGEOFF',
  SETTLED: 'SETTLED',
  BANKRUPTCY: 'BANKRUPTCY',
  IN_LOAN_MODIFICATION: 'IN_LOAN_MODIFICATION',
  PROMISE_TO_PAY: 'PROMISE_TO_PAY',
  PROMISE_TO_PAY_CONTACT_NEEDED: 'PROMISE_TO_PAY_CONTACT_NEEDED',
  LATE_FIRST_PAYMENT: 'LATE_FIRST_PAYMENT',
  NOT_IN_COLLECTIONS: 'NOT_IN_COLLECTIONS',
};

export const promiseToPayStatusEnum = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  INCOMPLETE: 'Incomplete',
  REMOVED: 'Removed',
};
