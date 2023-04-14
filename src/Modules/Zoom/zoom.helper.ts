import axios, { AxiosInstance } from 'axios';
import { ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } from '../../config/config';
import { zoomService } from './zoom.service';

export interface IZoomMeeting {
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  password: string;
  agenda: string;
}

const defaultZoomSetting = {
  settings: {
    host_video: false,
    participant_video: false,
    join_before_host: true,
    mute_upon_entry: true,
    use_pmi: false,
    approval_type: 0,
    audio: 'both',
    registrants_email_notification: true,
  },
};

// const zoomapi = axios.create({ baseURL: 'https://api.zoom.us/v2/users/8CpVjy24Rq6dW9yIBf2IxA' });

export const createZoomAxiosInstance = async (userId: number): Promise<AxiosInstance> => {
  const zoomId = await zoomService.getZoomId(userId);
  return axios.create({ baseURL: `https://api.zoom.us/v2/users/${zoomId}` });
};

export const RegenerateAccessToken = async (refresh_token: string, userId: number): Promise<string> => {
  const data = (
    await axios.post(`https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`, null, {
      auth: {
        username: ZOOM_CLIENT_ID,
        password: ZOOM_CLIENT_SECRET,
      },
    })
  ).data;

  await zoomService.updateZoomCredentials(userId, {
    userId,
    accessToken: data?.access_token,
    refreshToken: data?.refresh_token,
  });

  return data?.access_token;
};

export const createZoomMeeting = async (userId: number, data: IZoomMeeting): Promise<{ zoomMeetingLink: string }> => {
  const isAccessTokenValid: {
    valid: boolean;
    refresh_token?: string;
    access_token?: string;
  } = await zoomService.checkIfAccessTokenIsValid(userId);

  const accessToken = isAccessTokenValid.valid
    ? isAccessTokenValid?.access_token
    : await RegenerateAccessToken(isAccessTokenValid.refresh_token as string, userId);

  const zoomapi = await createZoomAxiosInstance(userId);

  const response = await zoomapi.post(
    '/meetings',
    { ...data, ...defaultZoomSetting },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return { zoomMeetingLink: response.data?.join_url };
};
