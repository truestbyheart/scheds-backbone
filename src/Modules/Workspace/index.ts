import { Router } from 'express';
import Auth from '../Shared/middlewares/Auth.middleware';
import { workspaceController } from './workspace.controller';
import { checkMemberExistance, isOwner } from '../Shared/middlewares/workspace.middleware';
import joiHandler from '../Shared/middlewares/joi.handler';
import { workspaceSchema } from './Validators';

const workspaceRouter = Router();

workspaceRouter.post('/create', Auth, joiHandler({ body: workspaceSchema }), workspaceController.createWorkspace);
workspaceRouter.post('/join', Auth, checkMemberExistance, workspaceController.joinWorkspace);
workspaceRouter.get('/:workspaceId', Auth, workspaceController.getWorkspaceInfo);
workspaceRouter.get('/all/:workspaceId', Auth, workspaceController.getWorkspaceEvents);
workspaceRouter.post('/invite/:workspaceId', Auth, workspaceController.sendInvites);
workspaceRouter.route('/remove/member/:workspaceId/:userId').delete(Auth, isOwner, workspaceController.removeUser);
workspaceRouter.patch('/update/member/:workspaceId/:userId', Auth, isOwner, workspaceController.updateWorkspaceUser);
workspaceRouter.get('/', Auth, workspaceController.getWorkspaces);

export default workspaceRouter;
