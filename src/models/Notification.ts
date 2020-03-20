import { model, Model, Schema, Document } from 'mongoose';

export interface INotification extends Document {
  message: string;
  id: string;
  date: Date;
}

const NotificationSchema: Schema = new Schema({
  message: { type: String },
  id: { type: String },
  date: { type: Date }
});

export const Notification: Model<INotification> = model<INotification>(
  'Notification',
  NotificationSchema
);
