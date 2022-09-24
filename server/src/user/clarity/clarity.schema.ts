import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDocument } from '../user.schema';
import { ScreenTrackingDocument } from '../screen-tracking/screen-tracking.schema';

export type ClarityDocument = ClarityResponse & Document;

@Schema({
  collection: 'clarityresponse',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class ClarityResponse {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;

  @Prop({ type: Object, required: false })
  raw: any;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, required: true })
  isHardPull: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ScreenTracking' })
  screenTracking: ScreenTrackingDocument; // monthly salary

  @Prop({ type: String, required: true })
  ruleName: string; // monthly salary

  @Prop({ type: Number, required: false })
  ruleNumber: number; // monthly salary

  @Prop({ type: Object, required: false })
  data: any;
}

export const ClarityResponseSchema =
  SchemaFactory.createForClass(ClarityResponse);
