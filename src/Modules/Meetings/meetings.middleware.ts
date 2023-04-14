import { Request, Response, NextFunction } from 'express';
import { recursionService } from '../Recursion/recursion.service';
import catchAsync from '../Shared/middlewares/errorHandler.middleware';
import { eventService } from '../Events/events.service';
import { BAD_REQUEST, CONFLICT } from 'http-status';
import { guestsService } from '../Guests/guest.service';
import ApiError from '../Shared/helpers/ApiError.helper';
import { meetingService } from './Meeting.service';
import { generateCalendarLinks } from '../Shared/helpers/calendarLink.generator';

export const getCalendarDetailFromRecursionId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    body: {
      recursion_id,
      current_meeting: { meeting_id },
      new_meeting: { id },
    },
  } = req;

  const recDetails = await recursionService.getRefreshTokenFromRecursionId(recursion_id);
  const hostDetail = await eventService.getHostFromRecursionId(recursion_id);
  const calMeetForCurrentMeeting = await meetingService.getCalMeetId(Number(meeting_id));
  const calMeetForNewMeeting = await meetingService.getCalMeetId(Number(id));
  console.log(recDetails);

  req.body.cal = {
    rec_info: {
      title: recDetails?.getDataValue('title'),
      description: recDetails?.getDataValue('description'),
    },
    host_info: {
      host_id: hostDetail?.getDataValue('host'),
      name: hostDetail?.getDataValue('hostInfo')?.getDataValue('name'),
      email: hostDetail?.getDataValue('hostInfo')?.getDataValue('email'),
    },
    event_calendar: {
      calendar_id: recDetails?.getDataValue('calendar')?.getDataValue('calendarId'),
      current_meeting_calmeetId: calMeetForCurrentMeeting?.getDataValue('calmeetId'),
      new_meeting_calmeetId: calMeetForNewMeeting?.getDataValue('calmeetId'),
      current_meeting_linkId: calMeetForCurrentMeeting?.getDataValue('linkId'),
      // @ts-ignore
      color_id: recDetails?.getDataValue('color')?.getDataValue('id'),
    },
    // @ts-ignore
    client_auth: recDetails?.getDataValue('manager') ? recDetails.manager.dataValues : recDetails.managee.dataValues,
  };

  // console.log(req.body);
  // return res.json({ data: { message: 'test' } });
  return next();
});

export const checkIfUserHasBookedCurrentSlot = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    body: {
      user_email,
      current_meeting: { meeting_id },
    },
  } = req;

  const hasBooked = await guestsService.checkGuestExistance({ email: user_email, id: meeting_id });
  if (hasBooked) return next();

  return next(new ApiError(BAD_REQUEST, 'Email was not found on current meeting', false, '', 'notBooked'));
});

export const checkIfSlotIsHasFreeSeats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    body: {
      new_meeting: { id },
    },
  } = req;

  // check if the new meeting slot is free for booking
  const isAvailable = await meetingService.checkMeetingAvailability(id);

  if (isAvailable) return next();

  return next(new ApiError(BAD_REQUEST, 'The slot you wish to book in is full', false, '', 'isFull'));
});

export const checkIfUserHasBookedNewSlot = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    body: {
      recursion_id,
      user_email,
      new_meeting: { id },
    },
  } = req;

  const hasBooked = await guestsService.checkGuestExistance({ email: user_email, id });
  if (hasBooked) return next();

  const recDetails = await recursionService.getRefreshTokenFromRecursionId(recursion_id);
  const meetingData = await meetingService.getBookingInfo(id);

  const calendarLinks = await generateCalendarLinks(
    meetingData?.getDataValue('time') as { from: string | Date; to: string | Date },
    recDetails?.getDataValue('title') as string,
    recDetails?.getDataValue('description') as string,
    meetingData?.getDataValue('meetingLink')?.getDataValue('link') as string,
  );

  return res.status(CONFLICT).json({
    status: CONFLICT,
    calendarLinks,
    message: 'Your have already booked the new meeting slot',
    type: 'hasBooked',
  });
});
