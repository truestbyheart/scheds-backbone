import { Router } from 'express';
import guestsController from './guests.controller';
import Auth from '../Shared/middlewares/Auth.middleware';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';
import { getRefreshToken } from './guest.middleware';

const guestRouter = Router();

guestRouter.patch('/delete/:guestId', Auth, getRefreshToken, catchAsync(guestsController.removeAttendee));

export default guestRouter;
