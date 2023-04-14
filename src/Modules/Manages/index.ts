import { Router } from 'express';
import Auth from '../Shared/middlewares/Auth.middleware';
import { manageController } from './manage.controller';
import { userInfo } from './middleware/userInfo.middleware';

const manageRouter = Router();

manageRouter.post('/request/permision', Auth, userInfo, manageController.sendPermissionInvite);
manageRouter.get('/managee/list', Auth, manageController.getManageeList);

export default manageRouter;
