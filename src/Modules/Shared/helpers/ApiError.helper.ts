import { HttpStatusClasses, HttpStatusExtra } from 'http-status';

class ApiError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly type: string;

  constructor(
    statusCode: number,
    message: string | number | HttpStatusClasses | HttpStatusExtra,
    isOperational = true,
    stack = '',
    type = 'normal',
  ) {
    super(message as string);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.type = type;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default ApiError;
