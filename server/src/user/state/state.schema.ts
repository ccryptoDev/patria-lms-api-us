import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StateDocument = State & Document;

@Schema({
  collection: 'state',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class State {
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPracticeActive: boolean;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  stateCode: string;
}

export const StateSchema = SchemaFactory.createForClass(State);
