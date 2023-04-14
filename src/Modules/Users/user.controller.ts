import { Request, Response, NextFunction } from 'express';
import { decodeJwt, generateUserCredentials, modifyWorkspaceToken, TokenPayload } from '../Shared/helpers/token.helper';
import { userService } from './user.service';
import { IUser, UserType } from '../../Database/models/User.model';
import { OK } from '../Shared/helpers/status.codes';
import { zoomService } from '../Zoom/zoom.service';
import { FRONTEND_URL, REFRESH_TOKEN_KEY } from '../../config/config';
import { managesService } from '../Manages/manages.service';
import { deleteItem, get as getFromRedis } from '../Shared/helpers/redis.helper';
import { has } from 'lodash';
import base64url from 'base64url';
import ApiError from '../Shared/helpers/ApiError.helper';
import { NOT_FOUND } from 'http-status';

export interface IProfileInfo {
  userInfo: {
    id: number;
    email: string;
    provider: string;
    type: UserType;
    name: string;
    photoUrl: string;
  } | null;
  analytics: {
    recursions: number;
    workspaces: number;
    member: number;
    managedBy: number;
    manages: number;
  };
  managedBy: {
    name: string;
    email: string;
    photoUrl: string;
  }[];
}
export class UserController {
  static async authRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        user: {
          // @ts-ignore
          profile: { email, provider, picture: photoUrl, displayName: name },
          // @ts-ignore
          refreshToken,
        },
        query: { state },
      } = req;
      const result = await userService.findCreateOrUpdate(
        {
          name,
          email,
          provider,
          photoUrl,
          type: UserType.USER,
          gRefreshToken: refreshToken,
        } as IUser,
        { email },
      );

      const {
        user: { id },
      } = result;

      let redirectURL = '';

      // Generate users Credentials i.e access_token and refresh_token
      const token = await generateUserCredentials({ id, email });

      // check if the user has a zoom account
      const hasZoom = await zoomService.checkIfUserIntegratedZoom(id);

      if (state) {
        const key = base64url.decode(state as string);
        const redisData = await getFromRedis(key);
        console.log(await getFromRedis(key));

        if (has(redisData, 'decoded.workspaceId')) {
          //  const { token } = redisData;
          const newAuth = { ...token, workspaceToken: modifyWorkspaceToken(redisData.token, result.user.photoUrl) };
          redirectURL = `${FRONTEND_URL}/auth/login-redirect?user=${JSON.stringify(result.user)}&token=${JSON.stringify(
            newAuth,
          )}&goto=/user/workspace/join&hasZoom=${hasZoom}`;
        } else {
          const {
            decoded: { id: managerId },
            token,
          } = redisData;

          // manager
          await managesService.createManager({ manager: managerId, managee: id }, { manager: managerId, managee: id });
          redirectURL = `${FRONTEND_URL}/client/grant/permission/${token}?isGoogle=true&userId=${id}`;
          await deleteItem(key);
        }
      } else {
        redirectURL = `${FRONTEND_URL}/auth/login-redirect?user=${JSON.stringify(result.user)}&token=${JSON.stringify(
          token,
        )}&hasZoom=${hasZoom}`;
      }

      // redirect the client back to the front-end
      res.redirect(redirectURL);
    } catch (error) {
      return next(error);
    }
  }

  static async getProfile(req: Request, res: Response) {
    const {
      query: { isProfile = false },
      // @ts-ignore
      data: { email },
    } = req;

    const user = await userService.findUserByEmail(email as string, JSON.parse(isProfile as string) as boolean);
    const hasZoom = await zoomService.checkIfUserIntegratedZoom(user.userInfo?.id as number);

    res.status(OK).json({
      user: JSON.parse(isProfile as string)
        ? {
            ...user,
            hasZoom,
          }
        : {
            ...user.userInfo,
            hasZoom,
          },
    });
  }

  static async generateNewUserCredentials(req: Request, res: Response, next: NextFunction) {
    // @ts-ignore
    const refreshToken = req.headers['x-refresh-token']?.split(' ')[1];
    const decoded = await decodeJwt(refreshToken as string, REFRESH_TOKEN_KEY);

    const result = await userService.getUserDetails(
      // @ts-ignore
      decoded.id as number,
    );

    if (!result) return next(new ApiError(NOT_FOUND, 'User not found', false));

    const user: TokenPayload = {
      id: result?.getDataValue('id'),
      email: result?.getDataValue('email'),
      photoUrl: result?.getDataValue('photoUrl'),
      provider: result?.getDataValue('provider'),
      type: result?.getDataValue('type'),
      name: result?.getDataValue('name'),
    };

    const token = await generateUserCredentials({ ...user });

    return res.status(OK).json({
      status: OK,
      credentials: token,
      user,
    });
  }
}

export default new UserController();
