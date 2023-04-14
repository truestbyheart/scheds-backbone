import { Router } from 'express';
import Auth from '../Shared/middlewares/Auth.middleware';
import CalModelController from './CalModel.controller';
import { pickUpUserData } from './middleware';

const calendarRouter = Router();

calendarRouter.get('/list', Auth, pickUpUserData, CalModelController.getCalendarList);
calendarRouter.get('/colors', Auth, CalModelController.getCalendarColors);

export default calendarRouter;
