import { model, Model, Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  status: string;
  id: string;
}

const TicketSchema: Schema = new Schema({
  status: { type: String },
  id: { type: String }
});

export const Ticket: Model<ITicket> = model<ITicket>('Ticket', TicketSchema);
