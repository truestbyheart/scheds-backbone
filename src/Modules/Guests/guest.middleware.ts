import { userService } from './../Users/user.service';
import { NextFunction } from 'express';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';

export const getRefreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    // @ts-ignore
    data: { id },
  } = req;

  const gRefreshToken = await userService.getRefreshToken(id);
  // @ts-ignore
  req.data = { ...req.data, ...gRefreshToken };
  next();
});
