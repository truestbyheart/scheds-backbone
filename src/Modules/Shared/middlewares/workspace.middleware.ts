import { Request, Response, NextFunction } from 'express';
import { CONFLICT, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from '../helpers/status.codes';
import { workspaceService } from '../../Workspace/workspace.service';
import { workspaceUsersService } from '../../Workspace/Users/workspaceusers.service';

export const isOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      params: { workspaceId },
      // @ts-ignore
      data: { id },
    } = req;

    const isAdmin = workspaceService.isWorkspaceAdmin(workspaceId, id);

    if (isAdmin) {
      next();
    } else {
      throw new Error('you have to be the owner in order to remove member');
    }
  } catch (e) {
    res.status(UNAUTHORIZED).json({
      status: UNAUTHORIZED,
      message: e,
    });
  }
};

export const checkMemberExistance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      body: { workspaceId },
      // @ts-ignore
      data: { id },
    } = req;

    const memberExists = await workspaceUsersService.checkMemberExistence(id, workspaceId);

    if (memberExists) {
      res.status(CONFLICT).json({
        status: CONFLICT,
        message: 'You are already a member of this workspace',
        workspaceId,
      });
      return;
    }
    next();
  } catch (e) {
    res.status(INTERNAL_SERVER_ERROR).json({
      status: INTERNAL_SERVER_ERROR,
      error: e,
    });
  }
};
