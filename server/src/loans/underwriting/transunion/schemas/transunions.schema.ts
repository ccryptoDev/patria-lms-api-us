import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { UserDocument } from '../../../../user/user.schema';

export type TransUnionsDocument = TransUnions & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
  // collection: 'transuniontruevalidate',
})
export class TransUnions {
  @Prop({ type: Object })
  addOnProduct: Record<string, any>;

  @Prop({ type: Object })
  creditCollection: Record<string, any>;

  @Prop({ type: [Object] })
  employment: Record<string, any>[];

  @Prop()
  firstName: string;

  @Prop({ type: [Object] })
  houseNumber: Record<string, any>[];

  @Prop({ type: [Object] })
  inquiry: Record<string, any>[];

  @Prop()
  isNoHit: boolean;

  @Prop()
  lastName: string;

  @Prop()
  middleName: string;

  @Prop({ type: [Object] })
  publicRecord: Record<string, any>[];

  @Prop()
  score: string;

  @Prop()
  socialSecurity: string;

  @Prop({ default: 0 })
  status: number;

  @Prop({ type: [Object] })
  trade: Record<string, any>[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: string | UserDocument;
}

export const TransUnionsSchema = SchemaFactory.createForClass(TransUnions);

export function getTransUnionSeed(): (TransUnions & { _id: string })[] {
  return [
    {
      _id: '5cdc1374c9675b310c26a2bb',

      addOnProduct: {
        addon: 'product',
      },
      creditCollection: {
        addon: 'product',
      },
      employment: [
        {
          software: 'engineering',
        },
      ],
      firstName: 'Sinigh',
      houseNumber: [{ number: '2' }],
      inquiry: [{ number: '2' }],
      isNoHit: true,
      lastName: 'Stern',
      middleName: 'Seligh',
      publicRecord: [{ number: 'whatever' }],
      score: '33',
      socialSecurity: '2408214',
      status: 0,
      trade: [{}, {}],
      user: 'cfd7958cf7d5fc5d7',
    },
    {
      _id: 'fc9acaf9589a5f810c26a2bb',

      addOnProduct: {
        addon: 'product',
      },
      creditCollection: {
        addon: 'product',
      },
      employment: [
        {
          software: 'engineering',
        },
      ],
      firstName: 'Sinigh',
      houseNumber: [{ number: '2' }],
      inquiry: [{ number: '2' }],
      isNoHit: true,
      lastName: 'Stern',
      middleName: 'Seligh',
      publicRecord: [{ number: 'whatever' }],
      score: '33',
      socialSecurity: '2408214',
      status: 0,
      trade: [{}, {}],
      user: 'cfd7958cf7d5fc5d7',
    },
  ];
}
