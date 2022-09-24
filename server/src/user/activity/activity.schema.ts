import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDocument } from '../user.schema';
import { ScreenTrackingDocument } from '../screen-tracking/screen-tracking.schema';

export type UserActivityDocument = UserActivity & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class UserActivity {
  @Prop()
  description: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  logData: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ScreenTracking' })
  screenTracking: string | ScreenTrackingDocument;

  @Prop()
  status: number;

  @Prop()
  subject: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;
}
export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
