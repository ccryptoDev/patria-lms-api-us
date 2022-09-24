import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDocument } from '../../../../user/user.schema';
import { PaymentDocument } from '../../payment.schema';
import { LoanPaymentProCardTokenDocument } from './loanpaymentpro-card-token.schema';

export type LoanPaymentProCardSaleDocument = LoanPaymentProCardSale & Document;

@Schema({
  collection: 'loanpaymentpro_card_sale',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class LoanPaymentProCardSale {
  @Prop()
  authCode: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanPaymentProCardToken',
  })
  cardToken: string | LoanPaymentProCardTokenDocument;

  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  })
  payment: string | PaymentDocument;

  @Prop({ required: true, type: Object })
  paymentRequest: Record<string, any>;

  @Prop({ required: true, type: Object })
  paymentResponse: Record<string, any>;

  @Prop({ required: true })
  responseCode: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;
}

export const LoanPaymentProCardSaleSchema = SchemaFactory.createForClass(
  LoanPaymentProCardSale,
);
