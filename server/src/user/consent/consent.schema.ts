import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { AgreementDocument } from '../../loans/agreement/agreement.schema';
import { PaymentManagementDocument } from '../../loans/payments/payment-management/payment-management.schema';
import { ScreenTrackingDocument } from '../screen-tracking/screen-tracking.schema';
import { UserDocument } from '../user.schema';

export type UserConsentDocument = UserConsent & Document;

@Schema({
  collection: 'userconsent',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class UserConsent {
  @Prop()
  agreementDocumentPath: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agreement' })
  agreement: string | AgreementDocument;

  @Prop()
  documentKey: string;

  @Prop()
  documentName: string;

  @Prop()
  documentVersion: string;

  @Prop()
  ip: string;

  @Prop({ default: 1 })
  loanUpdated: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PaymentManagement' })
  paymentManagement: string | PaymentManagementDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screenTracking: string | ScreenTrackingDocument;

  @Prop()
  signedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;
}

export const UserConsentSchema = SchemaFactory.createForClass(UserConsent);
