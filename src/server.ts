/* eslint-disable no-undef */
import { config } from 'dotenv';
import http from 'http';
import app from './app';

config();

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.info(`App running on port: ${PORT}`));
