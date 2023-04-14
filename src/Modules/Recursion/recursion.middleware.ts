import { FORBIDDEN } from 'http-status';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';
import { recursionService } from './recursion.service';
import ApiError from '../Shared/helpers/ApiError.helper';

export const deleteRecursionProtection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    params: { id },
    // @ts-ignore
    data: { id: userId },
  } = req;
  const isOwner = await recursionService.isOwner(userId, id);
  if (isOwner) return next();

  return next(new ApiError(FORBIDDEN, 'Only the owner can delete the event', true));
});
