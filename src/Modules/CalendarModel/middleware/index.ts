import { Request, Response, NextFunction } from 'express';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import { userService } from '../../Users/user.service';

export async function pickUpUserData(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore
  console.log(req.data);
  console.log(req.query.manageeId !== 'undefined');
  try {
    const {
      query: { manageeId },
      // @ts-ignore
      data: { id },
    } = req;
    const tobeFetched = manageeId !== undefined && manageeId !== 'undefined' ? manageeId : id;
    // @ts-ignore
    const { gRefreshToken } = await userService.getRefreshToken(tobeFetched);

    // @ts-ignore
    req.data.gRefreshToken = gRefreshToken;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(INTERNAL_SERVER_ERROR)
      .json({ status: INTERNAL_SERVER_ERROR, message: 'failure to pickup user data', error });
  }
}
