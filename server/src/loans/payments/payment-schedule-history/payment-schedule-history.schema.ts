import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { PracticeManagementDocument } from '../../../loans/practice-management/practice-management.schema';
import { ScreenTrackingDocument } from '../../../user/screen-tracking/screen-tracking.schema';
import { UserDocument } from '../../../user/user.schema';

export type PaymentScheduleHistoryDocument = PaymentScheduleHistory & Document;

@Schema({
  collection: 'payment_schedule_history',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class PaymentScheduleHistory {
  @Prop()
  amount: number;

  @Prop()
  apr: number;

  @Prop()
  creditScore: number;

  @Prop()
  declineReason: string;

  @Prop()
  failedCreditCount: number;

  @Prop([String])
  failedCreditTransactions: string[];

  @Prop()
  interestApplied: number;

  @Prop()
  isPaymentActive: boolean;

  @Prop()
  loanApprovedDate: Date;

  @Prop()
  loanReference: string;

  @Prop()
  loanStartDate: Date;

  @Prop()
  loanTermCount: number;

  @Prop()
  maturityDate: Date;

  @Prop()
  nextPaymentSchedule: Date;

  @Prop([])
  paymentSchedule: any[];

  @Prop()
  payOffAmount: number;

  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practiceManagement: string | PracticeManagementDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screenTracking: string | ScreenTrackingDocument;

  @Prop({ default: 'opened' })
  status: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string | UserDocument;
}

export const PaymentScheduleHistorySchema = SchemaFactory.createForClass(
  PaymentScheduleHistory,
);
