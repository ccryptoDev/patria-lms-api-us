import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { UserDocument } from '../../user/user.schema';
import { PracticeManagementDocument } from '../practice-management/practice-management.schema';
import { PaymentManagementDocument } from './payment-management/payment-management.schema';

export type PaymentDocument = Payment & Document;

@Schema({
  collection: 'payment',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Payment {
  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentManagement',
  })
  paymentManagement: string | PaymentManagementDocument;

  @Prop({ required: true })
  paymentReference: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practiceManagement: string | PracticeManagementDocument;

  @Prop({
    required: true,
    type: String,
    enum: ['pending', 'declined', 'returned', 'paid', 'processing'],
  })
  status: 'pending' | 'declined' | 'returned' | 'paid' | 'processing';

  @Prop({ required: true, type: String, enum: ['debit card', 'ACH'] })
  type: 'debit card' | 'ACH';

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string | UserDocument;

  @Prop({ required: true, type: String, enum: ['loanpaymentpro', 'FlexPay'] })
  vendor: 'loanpaymentpro' | 'FlexPay';

  @Prop()
  transactionMessage: string;

  @Prop()
  transId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
