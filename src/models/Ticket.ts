import { model, Model, Schema, Document } from 'mongoose';

export interface Ticket extends Document {
  status: string;
  id: string;
}

const TicketSchema: Schema = new Schema({
  status: { type: String },
  id: { type: String }
});

export const Ticket: Model<Ticket> = model<Ticket>('Ticket', TicketSchema);
