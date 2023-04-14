import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import {
  ZOOM_CLIENT_SECRET,
  ZOOM_CLIENT_ID,
  FRONTEND_URL,
  REDIRECT_URL,
  ZOOM_VERIFICATION_CODE,
} from '../../config/config';
import { INTERNAL_SERVER_ERROR, OK } from '../Shared/helpers/status.codes';
import { zoomService } from './zoom.service';
import { createZoomMeeting } from './zoom.helper';
import { nanoid } from 'nanoid';
import { set as storeInRedis, get, deleteItem } from '../Shared/helpers/redis.helper';

class ZoomController {
  async getUsersAuthDetail(req: Request, res: Response): Promise<any> {
    try {
      const {
        query: { code, token, url, state },
        params: { userId },
      } = req;

      // STEP 1: check if the incoming request consist of the code query parameter
      if (code) {
        // the zoom url for getting the access_token and refresh_token
        const url = `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URL}/${Number(
          userId,
        )}`;
        const user_url = 'https://api.zoom.us/v2/users/me';

        // fetch the users credential from zoom
        const result = (
          await axios.post(url, null, {
            auth: {
              username: ZOOM_CLIENT_ID,
              password: ZOOM_CLIENT_SECRET,
            },
          })
        ).data;

        // get zoom user details
        const zoom_user = (
          await axios.get(user_url, {
            headers: {
              Authorization: `Bearer ${result.access_token}`,
            },
          })
        ).data;

        // store users credential on the db
        await zoomService.storeZoomCredentials(Number(userId), {
          userId: Number(userId),
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          zoomId: zoom_user.id,
        });

        // get data from redis
        let retrived;
        if (state) {
          retrived = await get(state as string);
          await deleteItem(state as string);
        }

        // redirect the user back to our front-end app, this will be determined by the workspace token
        const frontend_url = token ? `${FRONTEND_URL}/workspace` : `${FRONTEND_URL}/user/events/dashboard`;
        const redirectUrl = state ? `${FRONTEND_URL}${retrived}` : frontend_url;

        return res.redirect(redirectUrl);
      }

      // STEP 1-sub: if not redirect the app to the zoom oauth page to get zoom code
      // Generate zoom auth redirect link based on the token from front end
      const zoomOauthUrl = token
        ? `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${REDIRECT_URL}/${Number(
            userId,
          )}&state=${JSON.stringify({ process: 'workspace', workspaceToken: token })}`
        : `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${REDIRECT_URL}/${Number(
            userId,
          )}`;

      let urlRedirect;
      const key = nanoid();
      if (url) {
        await storeInRedis(key, JSON.stringify(url));
        urlRedirect = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${REDIRECT_URL}/${Number(
          userId,
        )}&state=${key}`;
      } else {
        urlRedirect = zoomOauthUrl;
      }

      // redirect to the ouath page
      return res.redirect(urlRedirect);
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({
        status: 500,
        error: error.response ? error.response.data : error,
      });
    }
  }

  async checkValidity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        params: { userId },
      } = req;

      const data = await createZoomMeeting(Number(userId), {
        topic: 'api function test',
        agenda: 'we will survive',
        duration: 30,
        type: 2,
        password: '12345',
        start_time: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
      });

      res.json({ status: OK, data });
    } catch (error) {
      return next(error);
    }
  }

  async getTerms(req: Request, res: Response): Promise<void> {
    console.log('Respond');
    res.send(
      'By installing this app you accept connectedly to use your zoom account to create,update and modify meetings.',
    );
  }

  async getPolicy(req: Request, res: Response): Promise<void> {
    res.send('Policy will be provide upon official launch of the app.');
  }

  async getSupport(req: Request, res: Response): Promise<void> {
    res.send('Please send an email to support@connectedly.com for assistance');
  }

  async verify(req: Request, res: Response): Promise<void> {
    res.send(ZOOM_VERIFICATION_CODE);
  }
}

export const zoomController = new ZoomController();
