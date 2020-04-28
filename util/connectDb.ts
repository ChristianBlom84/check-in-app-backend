import mongoose from 'mongoose';
import { logger } from '@shared';

const db = `${process.env.MONGO_URI}`;

export const connectDB = async (): Promise<void> => {
  try {
    console.log('Connecting to ', db);

    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected.');
  } catch (err) {
    logger.error(err.message);
  }
};
