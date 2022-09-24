import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Chance } from 'chance';
const chance = Chance();

export type CountersDocument = Counter & Document;

@Schema({ versionKey: false, timestamps: { updatedAt: true } })
export class Counter {
  @Prop()
  appType: string;

  @Prop()
  sequenceValue: string;
}

export const CountersSchema = SchemaFactory.createForClass(Counter);

export function getCountersSeed(): (Counter & { _id: string })[] {
  return new Array(20).fill(0).map((_) => {
    return {
      _id: chance.guid({ version: 4 }),

      appType: 'user',
      sequenceValue: '426',
      save() {},
    } as any;
  });
}
