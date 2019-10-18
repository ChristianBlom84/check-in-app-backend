import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import path from 'path';
import BaseRouter from './routes';
import { Request, Response } from 'express';
import { jwtCookieProps } from '@shared';
import mongoose from 'mongoose';

// Init express
const app = express();

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', BaseRouter);

/**
 * Serve front-end content.
 */
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

app.get('/', (req: Request, res: Response) => {
  res.sendFile('login.html', { root: viewsDir });
});

/* app.get('/users', (req: Request, res: Response) => {
    const jwt = req.signedCookies[jwtCookieProps.key];
    if (!jwt) {
        res.redirect('/');
    } else {
        res.sendFile('users.html', {root: viewsDir});
    }
}); */

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0-ttyzl.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

app.get('/message', (req: Request, res: Response) => {
  const jwt = req.signedCookies[jwtCookieProps.key];
  if (!jwt) {
    res.redirect('/');
  } else {
    res.sendFile('message.html', { root: viewsDir });
  }
});

// Export express instance
export default app;
