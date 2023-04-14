import { FRONTEND_URL, REFRESH_TOKEN_KEY, TOKEN_KEY } from '../../../config/config';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../../Database/models/User.model';
import logger from '../../../config/logger.config';

export interface TokenPayload {
  id: number;
  email: string;
  photoUrl?: string;
  provider?: string;
  type?: string;
  name?: string;
}

export async function generateToken(payload: TokenPayload): Promise<string> {
  try {
    return jwt.sign(payload, TOKEN_KEY, { expiresIn: '3h' });
  } catch (error) {
    throw new Error('Error: failed to generate token');
  }
}

/**
 * @author nkpremices
 * * */
export const decodeJwt = (token: string, secret: string): TokenPayload => {
  try {
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new Error('Error: failed to decode token');
  }
};

/**
 * @author Daniel Mwangila
 * @description generate a token to encrypt the necessary data for joining a workspace.
 * @param payload
 */
export const generateWorkspaceInviteToken = (payload: any): string => {
  try {
    return jwt.sign(payload, TOKEN_KEY, { expiresIn: '72h' });
  } catch (error) {
    throw new Error('Error: failed to generate token');
  }
};

/**
 * @author Daniel Charles Mwangila
 * @description modify the content of the workspace token to show that the user has signup or updated from guest to user
 * @param token  user token
 * @param photoUrl user profile photo
 */
export const modifyWorkspaceToken = (token: string, photoUrl: string): string => {
  try {
    const workspaceToken = jwt.decode(token as string, TOKEN_KEY);
    // @ts-ignore
    workspaceToken.isUser = true;
    // @ts-ignore
    delete workspaceToken.iat;
    // @ts-ignore
    delete workspaceToken.exp;
    // @ts-ignore
    workspaceToken.photoUrl = photoUrl;

    return generateWorkspaceInviteToken(workspaceToken);
  } catch (error) {
    throw new Error('Error: failed to modify token');
  }
};

/**
 * @author Daniel Mwangila
 * @description generate user credentials ie access_token and refresh_token
 * @param payload
 */
export const generateUserCredentials = async (
  payload: TokenPayload,
): Promise<{ access_token: string; refresh_token: string }> => {
  try {
    const access_token = await generateToken(payload);
    const refresh_token = jwt.sign({ id: payload.id }, REFRESH_TOKEN_KEY);

    return { access_token, refresh_token };
  } catch (error) {
    throw new Error('Failed to generate user Credentials');
  }
};

/**
 * @author Daniel Mwangila
 * @description Determine of the redirect Url is for zoom integration or workspace registration.
 * @param req
 * @param result
 * @param credentials
 * @param hasZoom
 */
export const determineRedirectParameters = (
  req: Request,
  result: { isNew: boolean; user: User },
  credentials: { access_token: string; refresh_token: string; workspaceToken?: string },
  hasZoom: boolean,
): string => {
  let link = '';
  // destructure the session object to get the reason and token
  const { token, reason } = req.session;
  logger.debug(JSON.stringify({ token, reason }, null, 2));

  // Reason is an integer that represents the current process 1. for zoom and 2. for workspace
  if (Number(reason) === 2) {
    // modify the token
    credentials.workspaceToken = modifyWorkspaceToken(token, result.user.photoUrl);
    link = `${FRONTEND_URL}/auth/login-redirect?user=${JSON.stringify(result.user)}&token=${JSON.stringify(
      credentials,
    )}&goto=/workspace/join&hasZoom=${hasZoom}`;
  }

  return link;
};
