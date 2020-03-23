import { model, Model, Schema, Document } from 'mongoose';

export interface Subscriber extends Document {
  email: string;
  pushToken: string;
}

const SubscriberSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  pushToken: {
    type: String,
    required: true,
    unique: true
  }
});

export const Subscriber: Model<Subscriber> = model<Subscriber>(
  'Subscriber',
  SubscriberSchema
);
