import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Extend the default timeout so MongoDB binaries can download when first run
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

export const setupDb = async (): Promise<void> => {
  await mongoose.disconnect();

  const mongod = new MongoMemoryServer();
  const uri = await mongod.getConnectionString();

  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

export const tearDownDb = async (): Promise<void> => {
  mongoose.connection.close();
};

export const dropTables = async (): Promise<void> => {
  mongoose.connection.dropCollection('users');
};
