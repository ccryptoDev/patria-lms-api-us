import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { UserDocument } from '../../../../user/user.schema';

export type TransUnionHistoryDocument = TransUnionHistory & Document;

@Schema({
  collection: 'transunion_history',
  timestamps: { createdAt: true },
  versionKey: false,
})
export class TransUnionHistory {
  @Prop({ required: true, type: Object })
  requestData: string;

  @Prop({ type: Object })
  responseData: Record<string, any>;

  @Prop({ required: true, default: 0 })
  status: number;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;
}

export const TransUnionHistorySchema = SchemaFactory.createForClass(
  TransUnionHistory,
);

export function getTransUnionHistorySeed(): (TransUnionHistory & {
  _id: string;
})[] {
  return [
    {
      _id: '5cdc1374c9675b310c26a2bb',

      requestData: 'some request data',
      responseData: {
        response: 'data',
      },
      status: 0,
      user: 'cfd7958cf7d5fc5d7',
    },
    {
      _id: 'acf069acf6075b310c26a2bb',

      requestData: 'some request data',
      responseData: {
        response: 'data',
      },
      status: 0,
      user: '957afd5fc5d7',
    },
  ];
}
