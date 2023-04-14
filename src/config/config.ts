/* eslint-disable no-undef */
import dotenv from 'dotenv';
import path from 'path';

const environment = process.env.NODE_ENV || 'development';

const dir =
  environment.trim() === 'development'
    ? path.join(__dirname, '../../.env.development')
    : path.join(__dirname, '../../.env');

dotenv.config({ path: dir });

export const TOKEN_KEY: any = process.env.TOKEN_KEY;
export const REDIS_URL: any = process.env.REDIS_URL;
export const DATABASE_URL: any = process.env.DATABASE_URL;
export const DATABASE_DIALECT: any = process.env.DATABASE_DIALECT;
export const NODE_ENV: any = process.env.NODE_ENV;
export const EMAIL_USER: any = process.env.EMAIL_USER;
export const SEND_GRID_API_KEY: any = process.env.SEND_GRID_API_KEY;
export const FRONTEND_URL: any = process.env.FRONTEND_URL;
export const ZOOM_CLIENT_ID: any = process.env.ZOOM_CLIENT_ID;
export const ZOOM_CLIENT_SECRET: any = process.env.ZOOM_CLIENT_SECRET;
export const DOMAIN: any = process.env.DOMAIN;
export const REDIRECT_URL: any = process.env.REDIRECT_URL;
export const REFRESH_TOKEN_KEY: any = process.env.REFRESH_TOKEN_KEY;
export const ZOOM_VERIFICATION_CODE: any = process.env.ZOOM_VERIFICATION_CODE;
export const SESSION_SECRET: any = process.env.SESSION_SECRET;
export const APP_NAME: any = process.env.APP_NAME;
