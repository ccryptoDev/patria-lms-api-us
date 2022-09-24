import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PracticeManagementDocument } from '../../../loans/practice-management/practice-management.schema';

export type ApplicationLinkDocument = ApplicationLink & Document;

@Schema({
  collection: 'application_link',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class ApplicationLink {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  leadId: string;

  @Prop({ required: true })
  phone: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practiceManagement: string | PracticeManagementDocument;

  @Prop({ required: true })
  source: 'lead-list' | 'web';
}

export const ApplicationLinkSchema = SchemaFactory.createForClass(
  ApplicationLink,
);
