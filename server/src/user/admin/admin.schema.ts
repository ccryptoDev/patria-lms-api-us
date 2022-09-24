import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PracticeManagementDocument } from '../../loans/practice-management/practice-management.schema';
import { RolesDocument } from '../roles/roles.schema';

export type AdminDocument = Admin & Document;

@Schema({
  collection: 'admin_user',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class Admin {
  @Prop({ required: true })
  email: string;

  @Prop()
  isDeleted: boolean;

  @Prop()
  password?: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeManagement',
  })
  practiceManagement: string | PracticeManagementDocument;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Roles' })
  role: string | RolesDocument;

  @Prop({ required: true })
  userName: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
