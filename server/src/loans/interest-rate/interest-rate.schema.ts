import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {Chance} from "chance";
const chance = Chance();

export type LoanInterestRateDocument = LoanInterestRate & Document;

@Schema({
  collection: 'loan_interest_rate',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class LoanInterestRate {
  @Prop()
  adjWeightMax: number;

  @Prop()
  creditTier: string;

  @Prop()
  downPayment: number;

  @Prop()
  dtiMax: number;

  @Prop()
  dtiMin: number;

  @Prop()
  ficoMax: number;

  @Prop()
  ficoMin: number;

  @Prop()
  grade: string;

  @Prop()
  interestRate: number;

  @Prop()
  loanAmount: number;

  @Prop()
  maxLoanAmount: number;

  @Prop()
  minLoanAmount: number;

  @Prop()
  promoInterestRate: number;

  @Prop()
  promoTerm: number;

  @Prop()
  stateCode: string;

  @Prop()
  term: number;
}

export const LoanInterestRateSchema = SchemaFactory.createForClass(
  LoanInterestRate,
);

export function getLoanInterestRageSeed(): (LoanInterestRate & { _id: string })[] {
  return new Array(20).fill(0).map(_ => {
    return {
      _id: chance.guid({ version: 4 }),

      grade: chance.natural({max: 15}) + '',
      stateCode: chance.natural({max: 15}) + '',
      creditTier: "tier1",

      adjWeightMax: chance.natural({max: 15}),
      downPayment: chance.natural({max: 15}),
      dtiMax: chance.natural({max: 15}),
      dtiMin: chance.natural({max: 15}),
      ficoMax: chance.natural({max: 15}),
      ficoMin: chance.natural({max: 15}),
      interestRate: chance.natural({max: 15}),
      loanAmount: chance.natural({max: 15}),
      maxLoanAmount: chance.natural({max: 15}),
      minLoanAmount: chance.natural({max: 15}),
      promoInterestRate: chance.natural({max: 15}),
      promoTerm: chance.natural({max: 15}),
      term: chance.natural({max: 15}),
      save() {}
    } as any;
  });
}
