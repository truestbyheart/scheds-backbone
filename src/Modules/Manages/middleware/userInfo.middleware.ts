import { Request, Response, NextFunction } from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import { userService } from '../../Users/user.service';

export async function userInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      // @ts-ignore
      data: { id },
    } = req;

    const userData = await userService.getUserInfo(id);
    // @ts-ignore
    req.userData = userData;
    next();
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({
      status: INTERNAL_SERVER_ERROR,
      message: 'Failure to get userInfo',
      error,
    });
  }
}
