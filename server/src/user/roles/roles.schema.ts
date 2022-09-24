import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RolesDocument = Roles & Document;

@Schema({
  collection: 'roles',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Roles {
  @Prop({
    required: true,
    type: String,
    enum: ['Super Admin', 'Agent', 'User', 'Manager - LA'],
  })
  roleName: 'Agent' | 'Super Admin' | 'User' | 'Manager - LA';
}

export const RolesSchema = SchemaFactory.createForClass(Roles);
