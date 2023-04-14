// @ts-nocheck
/* eslint-disable no-undef */
import { Request } from 'express';
import passport from 'passport';
import { config } from 'dotenv';
import GoogleStrategy from 'passport-google-oauth2';

config();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN}/api/v1/users/auth/google/redirect`,
      passReqToCallback: true,
    } as GoogleStrategy.StrategyOptionsWithRequest,
    (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
      done(null, { profile, refreshToken, accessToken });
    },
  ),
);

export default passport;
