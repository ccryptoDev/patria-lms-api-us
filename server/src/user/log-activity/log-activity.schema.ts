import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AdminDocument } from '../admin/admin.schema';
import { ScreenTrackingDocument } from '../screen-tracking/screen-tracking.schema';
import { ICommunicationHistoryItems } from './communication-history.interface';

export type LogActivityDocument = LogActivity & Document;

export enum LOG_TYPE {
  USER_LOG = 'user',
  ADMIN_LOG = 'admin',
}

export enum MODULE_NAME {
  COMMUNICATION = 'Communication',
}

@Schema({
  collection: 'logactivity',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class LogActivity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' })
  userId: string | AdminDocument;

  @Prop()
  email: string;

  @Prop()
  status?: string;

  @Prop()
  actualValue?: string;

  @Prop()
  expectedValue?: string;

  @Prop({ default: LOG_TYPE.ADMIN_LOG, enum: Object.values(LOG_TYPE) })
  type?: LOG_TYPE;

  @Prop()
  moduleName: string;

  @Prop()
  requestUri: string;

  @Prop()
  message: string;

  @Prop()
  ip: string;

  @Prop()
  loanReference?: string;

  @Prop()
  logReference: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId || String,
    ref: 'ScreenTracking',
  })
  screenTrackingId?: any;

  @Prop()
  paymentManagementId?: string;

  @Prop()
  practiceManagementId: string;

  @Prop()
  jsonData?: string;

  @Prop()
  communicationHistory?: ICommunicationHistoryItems[];
}

export const LogActivitySchema = SchemaFactory.createForClass(LogActivity);
