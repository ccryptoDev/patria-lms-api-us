import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDocument } from '../../../../user/user.schema';

export type LoanPaymentProCardTokenDocument = LoanPaymentProCardToken &
  Document;

@Schema({
  collection: 'paymentaccounttoken',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class LoanPaymentProCardToken {
  @Prop({ required: true })
  billingAddress1: string;

  @Prop()
  billingAddress2: string;

  @Prop({ required: true })
  billingCity: string;

  @Prop()
  billingFirstName: string;

  @Prop()
  billingLastName: string;

  @Prop()
  billingState: string;

  @Prop({ required: true })
  billingZip: string;

  @Prop({ required: false })
  cardCode?: string;

  @Prop({ required: false })
  cardNumberLastFour?: string;

  @Prop({ required: false })
  cardNumber?: string;

  @Prop()
  customerToken: string;

  @Prop({ required: false })
  expMonth?: string;

  @Prop({ required: false })
  expYear?: string;

  @Prop({ required: false })
  paymentMethodToken?: string;

  @Prop({ required: true })
  paymentType: string;

  @Prop({ required: false })
  routingNumber?: string;

  @Prop({ required: false })
  accountNumber?: string;

  @Prop({ required: false })
  reaccountNumber?: string;

  @Prop({ required: false })
  financialInstitution?: string;

  @Prop({ required: false })
  nameOnCard?: string;

  @Prop({ required: false })
  accountType?: string;

  @Prop({ default: true })
  isDefault: boolean;

  @Prop()
  updatedAt?: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;
}

export const LoanPaymentProCardTokenSchema = SchemaFactory.createForClass(
  LoanPaymentProCardToken,
);
