import mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../screen-tracking/screen-tracking.schema';

enum institutionTypes {
  SAVING = 'Saving',
  CHECKING = 'Checking',
}

export type UserBankAccountDocument = UserBankAccount & Document;

@Schema({
  collection: 'userbankaccount',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class UserBankAccount {
  @Prop({ required: true })
  accountNumber: string;

  @Prop()
  routingNumber: string;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true, default: institutionTypes.CHECKING })
  institutionType: institutionTypes;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  user: string | UserDocument;

  @Prop()
  isDefault: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: ScreenTracking.name,
  })
  screentracking: string | ScreenTrackingDocument;
}

export const UserBankAccountSchema = SchemaFactory.createForClass(
  UserBankAccount,
);
