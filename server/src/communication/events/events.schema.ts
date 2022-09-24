import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';

export type EventsDocument = Events & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Events {
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

export const EventsSchema = SchemaFactory.createForClass(Events);
