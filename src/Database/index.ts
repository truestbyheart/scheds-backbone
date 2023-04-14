/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
import { Sequelize } from 'sequelize-typescript';
import { DATABASE_URL } from '../config/config';

const config = require('../config/sequelize.config');
console.debug('tsc:events.schema.ts', JSON.stringify(config, null, 3));

const db = new Sequelize(DATABASE_URL, {
  ...config,
  models: [`${__dirname}/models/**/*.model.{js,ts}`],
  modelMatch: (filename: string, member: string) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
  },
});

export { default as User } from './models/User.model';
export { default as BookMe } from './models/BookMe.model';

export default db;
export { Op } from 'sequelize';
