import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import Chance from 'chance';

import { PracticeManagementDocument } from '../../../loans/practice-management/practice-management.schema';

const chance = new Chance();
export type ProductRulesDocument = ProductRules & Document;

@Schema({
  collection: 'product_rules',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class ProductRules {
  @Prop()
  isDeleted: boolean;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practiceManagement: string | PracticeManagementDocument;

  @Prop({ type: Object })
  rules: Record<string, any>;

  @Prop()
  version: number;
}

export const ProductRulesSchema = SchemaFactory.createForClass(ProductRules);

export function getProductRulesSeed(): (ProductRules & { _id: string })[] {
  return new Array(20).fill(0).map(() => {
    return {
      _id: chance.guid({ version: 4 }),
      isDeleted: chance.bool(),
      practiceManagement: chance.guid({ version: 4 }),
      rules: {
        rule1: {
          ruleId: chance.guid({ version: 4 }),
          description: chance.sentence(),
          declinedIf: 'lt',
          value: 3,
        },
        rule2: {
          ruleId: chance.guid({ version: 4 }),
          description: chance.sentence(),
          declinedIf: 'gt',
          value: 8,
        },
      },
      version: chance.natural({ min: 1, max: 20 }),
    };
  });
}
export function getSingleProductRulesSeed(): ProductRules & { _id: string } {
  return {
    _id: chance.guid({ version: 4 }),
    isDeleted: chance.bool(),
    practiceManagement: chance.guid({ version: 4 }),
    rules: {
      rule1: {
        ruleId: chance.guid({ version: 4 }),
        description: chance.sentence(),
        declinedIf: 'lt',
        value: 3,
      },
      rule2: {
        ruleId: chance.guid({ version: 4 }),
        description: chance.sentence(),
        declinedIf: 'gt',
        value: 8,
      },
    },
    version: chance.natural({ min: 1, max: 20 }),
  };
}
