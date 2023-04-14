import redis from 'redis';
import { REDIS_URL } from './config';

const clientConnection = redis.createClient({
  url: REDIS_URL,
});

clientConnection.on('connect', () => console.info('redis connection established'));

clientConnection.on('error', (error: any) => console.error(error));

export default clientConnection;
