/* eslint-disable no-undef */
import express, { Application } from 'express';
import passport from 'passport';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import indexRouter from './Modules/Index';
import path from 'path';
// import publicRouter from './Modules/Public';
import { errorConverter, errorHandler } from './Modules/Shared/middlewares/error.middleware';

const app: Application = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine', 'ejs');

// setting up the app
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/public', publicRouter);
app.use('/api/v1', indexRouter);

app.use(errorConverter);
app.use(errorHandler);

export default app;
