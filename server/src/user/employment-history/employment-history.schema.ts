import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserDocument } from '../user.schema';
import { PracticeManagementDocument } from 'src/loans/practice-management/practice-management.schema';
import { ScreenTrackingDocument } from '../screen-tracking/screen-tracking.schema';

export type EmploymentHistoryDocument = EmploymentHistory & Document;

@Schema({
  collection: 'employmenthistory',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class EmploymentHistory {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practicemanagement: string | PracticeManagementDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string | UserDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screentracking: string | ScreenTrackingDocument;

  @Prop()
  employerName: string;

  @Prop()
  employerAddress: string;

  @Prop()
  employerCity: string;

  @Prop()
  employerState: string;

  @Prop()
  employerZip: string;

  @Prop()
  employerPhone: string;

  @Prop()
  currentIncome: number;

  @Prop()
  typeOfIncome: string;

  @Prop()
  employerStatus: string;

  @Prop()
  monthlyIncome: number;

  @Prop({ default: 0 })
  annualIncome: number;
}

export const EmploymentHistorySchema = SchemaFactory.createForClass(
  EmploymentHistory,
);
