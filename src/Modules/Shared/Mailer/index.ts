import mailer from '@sendgrid/mail';
import { APP_NAME, DOMAIN, FRONTEND_URL, SEND_GRID_API_KEY } from '../../../config/config';
import { commonHeader } from './Partials/common-header';
import { commonFooter } from './Partials/common-footer';
import template from './Templates/index';
import { renderFile } from 'ejs';
import path from 'path';
import { format } from 'date-fns';
import { sign } from 'jsonwebtoken';
import { readFileSync } from 'fs';

export interface ISender {
  receiver: string;
  sender: string;
  workspaceToken?: string;
}

export interface IWorkspaceDetails {
  member: ISender;
  workspaceName: string;
  description: string;
}

export interface IFriendlyDetails {
  member: ISender;
  title: string;
  description: string;
  photoUrl: string;
  slot: { date?: string; from: string; to: string };
  user: { name: string; email: string };
  meeting: { recursionId: string; meetingId: number; email: string };
}

export interface IPermission {
  name: string;
  email: string;
  photoUrl: string;
  token: string;
}

mailer.setApiKey(SEND_GRID_API_KEY);
export default class MailerService {
  async testEmail(data: ISender) {
    await mailer.send({
      to: data.receiver,
      from: data.sender,
      subject: 'Testing email provider',
      html: '<h1>Hello from connectedly</h1>',
    });
  }

  async sendWorkspaceInvitation(data: IWorkspaceDetails) {
    // variables
    const {
      member: { receiver, sender, workspaceToken },
      description,
      workspaceName,
    } = data;

    const messageBody = await renderFile(path.join(__dirname, 'Templates/workspace.invite.template.ejs'), {
      workspaceName,
      description,
      appname: APP_NAME,
      workspaceUrl: `${FRONTEND_URL}/user/workspace/join?token=${workspaceToken}`,
      year: new Date().getFullYear(),
      appicon: `${DOMAIN}/assets/app-logo.svg`,
      teamicon: `${DOMAIN}/assets/team.svg`,
    });

    // mail
    await mailer.send({
      to: receiver,
      from: sender,
      subject: `${sender} has invited to you to a connectedly workspace`,
      html: `${commonHeader}${messageBody}${commonFooter}`,
    });
  }

  async sendFriendlyInvites(data: IFriendlyDetails) {
    const {
      member: { receiver, sender },
      description,
      title,
      photoUrl,
      slot,
      user,
      meeting,
    } = data;

    // format date
    slot.date = format(new Date(slot.from), 'EEEE d	MMMM yyy');
    slot.from = format(new Date(slot.from), 'hh:mm bbbb');
    slot.to = format(new Date(slot.to), 'hh:mm bbbb');

    // create reference token for  invite email link
    const secretKey = readFileSync(path.join(process.cwd(), 'secret.key'));
    const token = sign({ ...meeting }, secretKey, { algorithm: 'RS256' });

    // buld the template from ejs
    const html = await renderFile(path.join(__dirname, 'Templates/friendInvitation.ejs'), {
      description,
      title,
      photoUrl,
      slot,
      year: new Date().getFullYear(),
      name: user.name,
      email: user.email,
      token,
      domain: DOMAIN,
    });

    await mailer.send({
      to: receiver,
      from: sender,
      subject: `You have been invited`,
      html,
    });
  }

  async sendPermissionInvite(user: ISender, data: IPermission) {
    const html = await renderFile(path.join(__dirname, 'Templates/permission.ejs'), {
      ...data,
      domain: DOMAIN,
      appname: APP_NAME,
      year: new Date().getFullYear(),
      redirectUrl: `${FRONTEND_URL}/client/grant/permission/${data.token}`,
      frontend: `${FRONTEND_URL}/auth/login`,
    });

    await mailer.send({
      to: user.receiver,
      from: user.sender,
      subject: `${data.name} has a permission request`,
      html,
    });

    return true;
  }
}

export const mailerService = new MailerService();
