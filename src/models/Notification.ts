import { model, Model, Schema, Document } from 'mongoose';

export interface Notification extends Document {
  message: string;
  id: string;
  user: string;
  organization?: string;
  date: Date;
}

const NotificationSchema: Schema = new Schema({
  message: { type: String },
  id: { type: String },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization'
  },
  date: { type: Date }
});

export const Notification: Model<Notification> = model<Notification>(
  'Notification',
  NotificationSchema
);
