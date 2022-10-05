import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ScreenTrackingDocument } from '../../../user/screen-tracking/screen-tracking.schema';
import { UserDocument } from '../../../user/user.schema';
// import { UserDocument } from '../../../../user/user.schema';
// import { PaymentDocument } from '../../payment.schema';
// import { LoanPaymentProCardTokenDocument } from './loanpaymentpro-card-token.schema';

export type FlexTransactionReportDocument = FlexTransactionReport & Document;

export enum TransactionStatus {
  PENDING = 'Pending',
  SETTLED = 'Settled',
  APPROVED = 'Approved',
  FAILED = 'Failed',
}

@Schema({
  collection: 'flex_transaction_report',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class FlexTransactionReport {
  @Prop({ required: true, type: Object })
  transaction: Record<string, any>;

  @Prop({ required: false })
  amount?: number;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true, default: TransactionStatus.PENDING })
  status?: TransactionStatus;

  @Prop({ required: true })
  paymentType: string;

  @Prop({ required: false, default: false })
  isDisbursed: boolean;

  @Prop({ required: false })
  itemStatusDescription?: string | null;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screenTracking: string | ScreenTrackingDocument;

  @Prop({ required: false })
  paymentRef: string;
}

export const FlexTransactionReportSchema = SchemaFactory.createForClass(
  FlexTransactionReport,
);
