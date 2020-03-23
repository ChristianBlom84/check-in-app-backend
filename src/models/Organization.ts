import { model, Model, Schema, Document } from 'mongoose';

export interface Organization extends Document {
  name: string;
  emailDomain: string;
}

const OrganizationSchema: Schema = new Schema({
  name: { type: String },
  emailDomain: { type: String }
});

export const Ticket: Model<Organization> = model<Organization>(
  'Organization',
  OrganizationSchema
);
