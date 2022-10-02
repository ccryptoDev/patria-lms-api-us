import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { PracticeManagementDocument } from '../loans/practice-management/practice-management.schema';
import { RolesDocument } from './roles/roles.schema';
import { StateDocument } from './state/state.schema';
import { ScreenTrackingDocument } from './screen-tracking/screen-tracking.schema';
import { AdminApprovalDocument } from './admin/approvals/approval.schema';

export type UserDocument = User & Document;

@Schema({
  collection: 'user',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class User {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'State' })
  _state: string | StateDocument;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ default: null })
  driversLicenseNumber: string;

  @Prop({ default: null })
  driversLicenseState: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false, default: false })
  isEmailVerified: boolean;

  @Prop({ required: false })
  secondaryEmail: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AdminApproval' })
  adminApproval: string | AdminApprovalDocument;

  @Prop()
  isDeleted: boolean;

  @Prop()
  isExistingLoan: boolean;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: null })
  middleName: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  resetPasswordToken: string;

  @Prop({ type: Date })
  resetPasswordTokenExpires: Date;

  @Prop({ type: [Object], required: true })
  phones: { phone: string; type: 'mobile' | 'home' | 'office' }[];

  @Prop()
  phoneNumber: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practiceManagement: string | PracticeManagementDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Roles' })
  role: string | RolesDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screenTracking: string | ScreenTrackingDocument;

  @Prop({ required: true })
  ssnNumber: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  street: string;

  @Prop({ default: null })
  unitApt: string;

  @Prop({ required: true })
  userReference: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop()
  customerUpdateToken: string;

  @Prop({ type: Date })
  customerUpdateTokenExpires: Date;

  @Prop()
  updatedSsn: string;

  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
