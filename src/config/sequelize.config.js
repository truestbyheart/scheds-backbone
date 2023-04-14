// @ts-nocheck
const dotenv = require('dotenv');
const path = require('path');

const environment = process.env.NODE_ENV || 'development';
console.log('======', process.env.NODE_ENV, '=======');

const dir =
  environment.trim() === 'development'
    ? path.join(__dirname, '../../.env.development')
    : path.join(__dirname, '../../.env');
console.log(dir);
const result = dotenv.config({ path: dir });

if (result.error) {
  throw result.error;
}
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_DIALECT = process.env.DATABASE_DIALECT;

const config = {
  [environment]: {
    url: DATABASE_URL,
    dialect: DATABASE_DIALECT || 'postgres',
    logging: false,
    use_env_variable: 'DATABASE_URL',
  },
};

// if (environment.trim() === 'production') {
config[environment].ssl = true;
config[environment].dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};
// }

module.exports = config[environment];
