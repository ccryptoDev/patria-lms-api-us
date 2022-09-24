import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';

export type CommentsDocument = Comments & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Comments {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screenTracking: string | ScreenTrackingDocument;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
