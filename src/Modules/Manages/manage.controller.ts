import { OK } from 'http-status';
import { Response, Request, NextFunction } from 'express';
import { sign } from 'jsonwebtoken';
import { FRONTEND_URL, SESSION_SECRET } from '../../config/config';
import { mailerService } from '../Shared/Mailer';
import { managesService } from './manages.service';

class ManageController {
  async sendPermissionInvite(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        body: { email, canSendEmail},
        // @ts-ignore
        data: { id },
        //@ts-ignore
        userData: { email: managerEmail, photoUrl, name },
      } = req;

      const permisionToken = sign({ id, managerEmail, photoUrl, name }, SESSION_SECRET);

      if (canSendEmail) {
        const isSent = await mailerService.sendPermissionInvite(
          { receiver: email, sender: managerEmail },
          {
            name,
            photoUrl,
            token: permisionToken,
            email: managerEmail,
          },
        );
        if (!isSent) throw 'permission request was not sent';
      }

      return res.status(OK).json({
        status: OK,
        message: 'permission request sent successfully',
        link: `${FRONTEND_URL}/client/grant/permission/${permisionToken}`,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getManageeList(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        // @ts-ignore
        data: { id },
        query: { page = 1, limit = 12 },
      } = req;

      const managees = await managesService.getManageeList(id, Number(limit), Number(page));
      res.status(OK).json({ ...managees });
    } catch (error) {
      return next(error);
    }
  }
}

export const manageController = new ManageController();
