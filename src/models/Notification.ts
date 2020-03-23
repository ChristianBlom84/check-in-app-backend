import { model, Model, Schema, Document } from 'mongoose';

export interface Notification extends Document {
  message: string;
  id: string;
  userId: string;
  organizationID?: string;
  date: Date;
}

const NotificationSchema: Schema = new Schema({
  message: { type: String },
  id: { type: String },
  userId: { type: String },
  organizationId: { type: String },
  date: { type: Date }
});

export const Notification: Model<Notification> = model<Notification>(
  'Notification',
  NotificationSchema
);
