import { model, Model, Schema, Document } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  pushToken: string;
}

const SubscriberSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  pushToken: {
    type: String,
    required: true
  }
});

export const Subscriber: Model<ISubscriber> = model<ISubscriber>(
  "Subscriber",
  SubscriberSchema
);
