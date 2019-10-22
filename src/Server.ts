import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import path from 'path';
import BaseRouter from './routes';
import mongoose from 'mongoose';

// Init express
const app = express();

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({ origin: process.env.CORS, credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', BaseRouter);

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0-ttyzl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

// Export express instance
export default app;
