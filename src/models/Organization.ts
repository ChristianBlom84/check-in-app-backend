import { model, Model, Schema, Document } from 'mongoose';
import { Notification } from './Notification';

export interface Organization extends Document {
  name: string;
  emailDomain: string;
  users: [string];
  notifications: Notification[];
}

const OrganizationSchema: Schema = new Schema({
  name: { type: String },
  emailDomain: { type: String },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Notification'
    }
  ]
});

export const Organization: Model<Organization> = model<Organization>(
  'Organization',
  OrganizationSchema
);
