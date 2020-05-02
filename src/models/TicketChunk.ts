import { model, Model, Schema, Document } from 'mongoose';

export interface Ticket {
  status: string;
  id: string;
  message: string;
}
export interface ITicketChunk extends Document {
  tickets: Ticket[];
  date: Date;
}

const TicketChunkSchema: Schema = new Schema({
  tickets: [
    {
      status: String,
      id: String,
      message: String
    }
  ],
  date: { type: Date }
});

export const TicketChunk: Model<ITicketChunk> = model<ITicketChunk>(
  'TicketChunk',
  TicketChunkSchema
);
