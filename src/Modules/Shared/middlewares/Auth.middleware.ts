/* eslint-disable no-undef */
import { NextFunction, Request, Response } from 'express';
import { decodeJwt, TokenPayload } from '../helpers/token.helper';
import { TOKEN_KEY } from '../../../config/config';

async function Auth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      headers: { authorization: token },
    } = req;

    if (token === undefined || token === 'expired') {
      res.status(401).json({
        status: 401,
        message: "You're not authorized to get this data.",
      });
      return;
    }
    req.data = <TokenPayload>decodeJwt(token, TOKEN_KEY);
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      error,
    });
  }
}

export default Auth;
