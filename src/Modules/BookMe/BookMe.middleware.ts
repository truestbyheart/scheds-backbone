import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';
import bookMeService from './BookMe.service';

export const pickUpBookMeInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    params: { bookme_id },
  } = req;
  const result = await bookMeService.getBookMe(bookme_id);
  console.log(result);

  if (result) {
    // @ts-ignore
    req.bookme = result;
    return next();
  }
  return res.status(BAD_REQUEST).json({
    status: BAD_REQUEST,
    message: 'Bookme Info your trying to retrieve is missing or moved.',
  });
});
