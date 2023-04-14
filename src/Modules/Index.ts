import { Router } from 'express';
import usersRouter from './Users';
import eventsRouter from './Events';
import calendarRouter from './CalendarModel';
import recursionRouter from './Recursion';
import zoomRouter from './Zoom';
import workspaceRouter from './Workspace';
// import { UI } from 'bull-board';
import manageRouter from './Manages';
import bookMeRouter from './BookMe';
import guestRouter from './Guests';
import meetingRouter from './Meetings';

const indexRouter = Router();

// indexRouter.use('/', homeRouter);
indexRouter.use('/', meetingRouter);
indexRouter.use('/users', usersRouter);
indexRouter.use('/events', eventsRouter);
indexRouter.use('/cal', calendarRouter);
indexRouter.use('/recursion', recursionRouter);
indexRouter.use('/zoom', zoomRouter);
indexRouter.use('/workspace', workspaceRouter);
indexRouter.use('/manager', manageRouter);
indexRouter.use('/bookme', bookMeRouter);
indexRouter.use('/guest', guestRouter);
// Bull board monitor
// indexRouter.use('/background', UI);

export default indexRouter;
