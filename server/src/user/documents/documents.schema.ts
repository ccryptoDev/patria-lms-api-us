import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { UserDocument } from '../user.schema';
import { Roles } from '../roles/roles.schema';

export type UserDocumentsDocument = UserDocuments & Document;

@Schema({
  collection: 'userdocuments',
  timestamps: { createdAt: true, updatedAt: true },
  versionKey: false,
})
export class UserDocuments {
  @Prop({ type: Object })
  driversLicense: { front: string; back: string };

  @Prop()
  passport: string;

  @Prop()
  paystub: string;

  @Prop()
  otherDoc: string;

  @Prop()
  otherDocTitle: string | null;

  @Prop()
  proofOfResidence: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string | UserDocument;

  @Prop({ type: String })
  uploaderRole: Roles['roleName'];

  @Prop()
  uploaderName: string;

  @Prop()
  uploaderId: string;
}

export const UserDocumentsSchema = SchemaFactory.createForClass(UserDocuments);
