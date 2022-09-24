import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserConsentDocument } from '../consent/consent.schema';
import { ScreenTrackingDocument } from '../screen-tracking/screen-tracking.schema';
import { UserDocument } from '../user.schema';

import { Chance } from 'chance';
const chance = Chance();

export type EsignatureDocument = Esignature & Document;

@Schema({
  collection: 'esignature',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Esignature {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserConsent',
  })
  consent: string | UserConsentDocument;

  @Prop()
  device: string;

  @Prop()
  fullName: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  isImageProcessed: boolean;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScreenTracking',
  })
  screenTracking: string | ScreenTrackingDocument;

  @Prop({ required: true })
  signature: string;

  @Prop()
  signaturePath: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string | UserDocument;
}

export const EsignatureSchema = SchemaFactory.createForClass(Esignature);

export function getEsignatureSeed(): (Esignature & { _id: string })[] {
  return new Array(20).fill(0).map(() => {
    return {
      _id: chance.guid({ version: 4 }),
      active: chance.natural(),
      consent: chance.guid({ version: 4 }),
      device: chance.word(),
      fullName: chance.name(),
      ipAddress: chance.ip(),
      isImageProcessed: chance.bool(),
      screenTracking: chance.guid({ version: 4 }),
      signature: chance.word(),
      signaturePath: chance.word(),
      type: chance.natural(),
      user: chance.guid({ version: 4 }),
    };
  });
}
