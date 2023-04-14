import { Router } from 'express';
import joiHandler from '../Shared/middlewares/joi.handler';
import { eventsController } from './events.controller';
import { checkMeetingAvailability, gatherEventInfo, hasBooked } from './events.middleware';
import { bookingContent } from './events.schema';
import Auth from '../Shared/middlewares/Auth.middleware';

const eventsRouter = Router();

eventsRouter.get('/:id', eventsController.getOne);
eventsRouter.post(
  '/client/booking',
  gatherEventInfo,
  joiHandler(bookingContent),
  checkMeetingAvailability,
  hasBooked,
  eventsController.bookEvent,
);
eventsRouter.get('/info/:id', Auth, eventsController.getEventInfo);
export default eventsRouter;
