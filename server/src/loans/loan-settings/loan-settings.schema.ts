import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoanSettingsDocument = LoanSettings & Document;

@Schema({
  collection: 'loansettings',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class LoanSettings {
  @Prop()
  nsfFee: number;

  @Prop()
  lateFee: number;

  @Prop()
  lateFeeGracePeriod: number;

  @Prop()
  delinquencyPeriod: number;

  @Prop()
  eventsUrl?: string;

  @Prop()
  eventsAuthToken?: string;
}

export const LoanSettingsSchema = SchemaFactory.createForClass(LoanSettings);
