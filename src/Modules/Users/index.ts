/* eslint-disable no-undef */
import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from './user.controller';
import passport from '../../config/passport';
import Auth from '../Shared/middlewares/Auth.middleware';
import { nanoid } from 'nanoid';
import clientConnection from '../../config/redis.config';
import { decode } from 'jsonwebtoken';
import base64url from 'base64url';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';

const router = Router();

// const getCallbackURL = (plaform: string, fallbackUrl: string) =>
//   `${process.env.DOMAIN}/api/v1/users/auth/${plaform}/redirect/calendar?fallback=${fallbackUrl || ''}`;

router.get('/auth/google', (req: Request, res: Response<any>, next: NextFunction) => {
  const {
    query: { token },
  } = req;

  let nano = '';
  // add the token to session.
  if (token) {
    nano = nanoid();
    console.log(decode(token as string));
    clientConnection.set(nano, JSON.stringify({ decoded: decode(token as string), token }));
  }
  // res.send({});

  passport.authenticate('google', {
    // @ts-ignore
    callbackURL: `${process.env.DOMAIN}/api/v1/users/auth/google/redirect`,
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    accessType: 'offline',
    prompt: 'consent',
    state: base64url(nano),
  })(req, res, next);
});

router.get('/auth/google/redirect', passport.authenticate('google'), UserController.authRedirect);

router.get('/profile', Auth, catchAsync(UserController.getProfile));

router.post('/token', catchAsync(UserController.generateNewUserCredentials));

export default router;
