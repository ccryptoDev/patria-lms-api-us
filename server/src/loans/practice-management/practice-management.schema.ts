import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PracticeManagementDocument = PracticeManagement & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
  collection: 'practice_management',
})
export class PracticeManagement {
  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  isDeleted: boolean;

  @Prop()
  location: string;

  @Prop()
  managementRegion: string;

  @Prop()
  openDate: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  region: string;

  @Prop()
  regionalManager: string;

  @Prop()
  stateCode: string;

  @Prop()
  status: boolean;

  @Prop()
  zip: string;
}

export const PracticeManagementSchema = SchemaFactory.createForClass(
  PracticeManagement,
);
