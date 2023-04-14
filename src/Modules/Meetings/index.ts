import { Router } from 'express';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';
import MeetingsController from './Meetings.controller';
import {
  checkIfUserHasBookedCurrentSlot,
  checkIfSlotIsHasFreeSeats,
  checkIfUserHasBookedNewSlot,
  getCalendarDetailFromRecursionId,
} from './meetings.middleware';

const meetingRouter = Router();

meetingRouter.get('/client/meeting/:email/:recursion_id', catchAsync(MeetingsController.getRecursionDetails));
// meetingRouter.post('/client/meeting/response', MeetingsController.storeUserResponse);
meetingRouter.post(
  '/client/meeting/reschedule',
  checkIfUserHasBookedCurrentSlot,
  checkIfUserHasBookedNewSlot,
  checkIfSlotIsHasFreeSeats,
  getCalendarDetailFromRecursionId,
  catchAsync(MeetingsController.rescheduleMeeting),
);
meetingRouter.post('/client/meetings', catchAsync(MeetingsController.getClientMeetings));
meetingRouter.post('/client/cancel/meeting', catchAsync(MeetingsController.cancelMeeting));
meetingRouter.get('/client/event/:event_id/:meeting_id', catchAsync(MeetingsController.getMeetingDetails));

export default meetingRouter;
