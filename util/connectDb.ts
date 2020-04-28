import mongoose from 'mongoose';
import { logger } from '@shared';

const db = `${process.env.MONGO_URI}`;

export const connectDB = async (): Promise<void> => {
  try {
    logger.info('Connecting to ', db);

    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    logger.info('MongoDB connected.');
  } catch (err) {
    logger.error(err.message);
  }
};
