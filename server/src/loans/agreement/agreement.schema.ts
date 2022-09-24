import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PracticeManagementDocument } from '../practice-management/practice-management.schema';

export type AgreementDocument = Agreement & Document;

@Schema({
  collection: 'agreement',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Agreement {
  @Prop()
  active: boolean;

  @Prop()
  documentBody: string;

  @Prop()
  documentKey: string;

  @Prop()
  documentName: string;

  @Prop()
  documentPath: string;

  @Prop()
  documentVersion: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'PracticeManagement' })
  practiceManagement: string | PracticeManagementDocument;

  @Prop()
  signatureRequired: boolean;
}

export const AgreementSchema = SchemaFactory.createForClass(Agreement);
