import { model, Model, Schema, Document } from 'mongoose';

export interface ITicketChunk extends Document {
  tickets: [];
}

const TicketChunkSchema: Schema = new Schema({
  tickets: [
    {
      type: Schema.Types.Mixed
    }
  ]
});

export const TicketChunk: Model<ITicketChunk> = model<ITicketChunk>(
  'TicketChunk',
  TicketChunkSchema
);
