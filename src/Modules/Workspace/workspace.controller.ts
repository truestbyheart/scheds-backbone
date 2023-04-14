import { NOT_FOUND } from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { userService } from '../Users/user.service';
import { CREATED, INTERNAL_SERVER_ERROR, OK } from '../Shared/helpers/status.codes';
import { workspaceService } from './workspace.service';
import { v4 as uuid } from 'uuid';
import { generateWorkspaceInviteToken } from '../Shared/helpers/token.helper';
import { runInBackground } from '../../config/bull.config';
import { workspaceUsersService } from './Users/workspaceusers.service';
import { IWorkspaceUser, RoleType } from '../../Database/models/workspace-users.model';
import { recursionService } from '../Recursion/recursion.service';
import { ISender } from '../Shared/Mailer';
import { emailWorker } from '../Shared/workers/email.worker';

class WorkspaceController {
  async createWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        body: { members, info },
        // @ts-ignore
        data: { id, email },
      } = req;

      // const ownerEmail = await userService.getUsersEmail(id);
      const workspace = await workspaceService.createWorkspace({
        id: uuid(),
        name: info.name,
        description: info.description ? info.description : null,
        owner: id,
      });
      await workspaceUsersService.createWorkspacUser({
        userId: id,
        role: RoleType.OWNER,
        workspaceId: workspace.id,
      });

      // Create a token with the essential credential for the user.
      const invitees: Array<ISender> = [];

      await Promise.all(
        members.map(async (member: { firstname: string; lastname: string; email: string; role: string }) => {
          const isUser = await userService.checkIfUser(member.email);

          // Generate workspace token
          const workspaceToken = await generateWorkspaceInviteToken({
            workspaceName: info.name,
            workspaceId: workspace.id,
            email: member.email,
            isUser,
            role: member.role,
          });

          // create an array list of all invitees
          invitees.push({
            receiver: member.email,
            sender: email,
            workspaceToken,
          });
        }),
      );

      // add the invitee to the background email service
      runInBackground({
        taskId: uuid(),
        data: {
          members: invitees,
          workspaceName: info.name,
          description: info.description,
        },
        consumerFn: {
          className: emailWorker,
          method: 'sendWorkspaceInvites',
        },
      });

      res.status(CREATED).json({
        status: CREATED,
        workspaceId: workspace.id,
        message: 'workspace created successfully and invites sent.',
      });
    } catch (error) {
      return next(error);
    }
  }

  async joinWorkspace(req: Request, res: Response): Promise<void> {
    try {
      const {
        body: { role, workspaceId },
        // @ts-ignore
        data: { id },
      } = req;

      await workspaceUsersService.createWorkspacUser({ workspaceId, role, userId: id } as IWorkspaceUser);

      res.status(CREATED).json({
        status: CREATED,
        workspaceId,
      });
    } catch (error) {
      res.status(INTERNAL_SERVER_ERROR).json({
        status: INTERNAL_SERVER_ERROR,
        error,
      });
    }
  }

  async getWorkspaceInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        params: { workspaceId },
        query: { limit = 10, page = 1 },
      } = req;
      const data = await workspaceService.getWorkspaceDetail(workspaceId, Number(limit), Number(page));
      if (data.details === null) {
        res.status(NOT_FOUND).json({
          status: NOT_FOUND,
          message: 'Workspace not found',
        });
        return;
      }
      res.status(OK).json({
        status: OK,
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getWorkspaceEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        params: { workspaceId },
        query: { page = 1, limit = 10 },
      } = req;

      const pagedResult = await recursionService.getWorkspaceRecursion(
        limit as number,
        page as number,
        workspaceId as string,
      );

      if (pagedResult.pageMeta.page < page) {
        res.status(OK).json({ message: 'no data on the requested page' });
        return;
      }

      res.status(OK).json(pagedResult);
    } catch (error) {
      return next(error);
    }
  }

  async sendInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        params: { workspaceId },
        body: { members = [], ownerEmail, workspaceName },
      } = req;

      // Create a token with the essential credential for the user.
      const invitees: Array<ISender> = [];
      await Promise.all(
        members.map(async (member: { firstname: string; lastname: string; email: string; role: string }) => {
          const isUser = await userService.checkIfUser(member.email);
          const workspaceToken = await generateWorkspaceInviteToken({
            workspaceName,
            workspaceId,
            email: member.email,
            isUser,
            role: member.role,
          });

          invitees.push({
            sender: ownerEmail,
            receiver: member.email,
            workspaceToken,
          });
        }),
      );

      const description = await workspaceService.getDescription(workspaceId);

      // add the invitee to the background email service
      runInBackground({
        taskId: uuid(),
        data: {
          members: invitees,
          workspaceName,
          description,
        },
        consumerFn: {
          className: emailWorker,
          method: 'sendWorkspaceInvites',
        },
      });

      res.status(OK).json({
        status: OK,
        message: 'Invites sent successfully',
      });
    } catch (error) {
      return next(error);
    }
  }

  async removeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        params: { workspaceId, userId },
      } = req;

      await workspaceUsersService.deleteWorkspaceUser(Number(userId), workspaceId);
      const members = await workspaceUsersService.getWorkspaceMembers(workspaceId);

      res.status(OK).json({
        status: OK,
        message: 'Member is successfully removed',
        members,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getWorkspaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        query: { page = 1, limit = 10 },
        // @ts-ignore
        data: { id },
      } = req;

      const pagedResult = await workspaceUsersService.getUsersWorkspaces(id, page as number, limit as number);

      if (pagedResult.pageMeta.page < page) {
        res.status(OK).json({ message: 'no data on the requested page' });
        return;
      }

      res.status(OK).json(pagedResult);
    } catch (error) {
      return next(error);
    }
  }

  async updateWorkspaceUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        params: { userId, workspaceId },
        body: { role },
      } = req;
      await workspaceUsersService.updateUserRole(Number(userId), { role: role.toLowerCase() });
      const members = await workspaceUsersService.getWorkspaceMembers(workspaceId);

      return res.status(OK).json({
        status: OK,
        message: 'User Role Updated Successfully',
        members,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();
