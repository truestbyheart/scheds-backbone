import clientConnection from '../../../config/redis.config';

export const get = (key: string): Promise<any> =>
  new Promise((resolve, reject) => {
    clientConnection.get(key, (err, reply) => {
      if (err) reject(err);
      // @ts-ignore
      resolve(JSON.parse(reply));
    });
  });

export const deleteItem = (key: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    clientConnection.del(key, (err, _reply) => {
      if (err) reject(err);
      resolve(true);
    });
  });

export const set = (key: string, payload: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    clientConnection.set(key, payload, (err, _reply) => {
      if (err) reject(err);
      resolve(true);
    });
  });
