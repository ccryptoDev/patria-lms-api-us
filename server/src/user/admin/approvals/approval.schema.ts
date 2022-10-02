import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';
import { UserDocument } from 'src/user/user.schema';
import { AdminDocument } from '../admin.schema';

export type AdminApprovalDocument = AdminApproval & Document;

export enum APPROVAL_STATUS {
  APPROVED = 'approved',
  DENIED = 'denied',
  PENDING = 'pending',
  SEMI_APPROVED = 'semi-approved',
}

@Schema({
  collection: 'admin_approvals',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class AdminApproval {
  @Prop({ required: true })
  email: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  agent: string | AdminDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' })
  approvedBy: string | AdminDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  user?: string | UserDocument;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
    default: null,
  })
  screenTracking?: string | ScreenTrackingDocument;

  @Prop({
    type: String,
    enum: Object.values(APPROVAL_STATUS),
    default: APPROVAL_STATUS.PENDING,
  })
  status: 'approved' | 'denied' | 'pending' | 'semi-approved';

  @Prop()
  fieldToUpdate?: [{ key: string; value: string }];

  @Prop()
  currentValue?: [{ key: string; value: string }];

  @Prop()
  description?: string;

  @Prop({ require: true })
  collectionName?: string;

  @Prop()
  isDeleted: boolean;
}

export const AdminApprovalSchema = SchemaFactory.createForClass(AdminApproval);
