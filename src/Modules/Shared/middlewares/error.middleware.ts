import httpStatus, { INTERNAL_SERVER_ERROR } from 'http-status';
import { Response, Request, NextFunction } from 'express';
import logger from '../../../config/logger.config';
import ApiError from '../helpers/ApiError.helper';

export const errorConverter = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const message = error.message || httpStatus[INTERNAL_SERVER_ERROR];
    error = new ApiError(INTERNAL_SERVER_ERROR, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  let { statusCode, message } = err;
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = INTERNAL_SERVER_ERROR;
    // @ts-ignore
    message = httpStatus[INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    status: statusCode,
    message,
    type: err.type,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  logger.error(JSON.stringify(err, null, 2));

  return res.status(statusCode).json(response);
};
