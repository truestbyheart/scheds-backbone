import { Request, Response, NextFunction } from 'express';
import { CONFLICT } from 'http-status';
import { guestsService } from '../Guests/guest.service';
import { meetingService } from '../Meetings/Meeting.service';
import { recursionService } from '../Recursion/recursion.service';
import { generateCalendarLinks } from '../Shared/helpers/calendarLink.generator';
import { eventService } from './events.service';
import Meeting from '../../Database/models/Meeting.model';
import Recursion from '../../Database/models/Recursion.model';

export async function hasBooked(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const {
      body: {
        user: { email },
        event: { slotId },
      },
      info,
    } = req;

    const exists = await guestsService.checkGuestExistance({ email, id: slotId });
    if (exists) {
      const calendarLinks = await generateCalendarLinks(
        info.meeting.time,
        info.recursion.title,
        info.recursion.description,
        info.meeting.meetingLink.link,
      );
      return res.status(CONFLICT).json({
        status: CONFLICT,
        type: 'hasBooked',
        message: 'you already booked the meeting',
        calendarLinks,
      });
    }

    next();
  } catch (error) {
    const err = new Error('Failure to check book status');
    next(err);
  }
}

export async function checkMeetingAvailability(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const {
      body: {
        event: { slotId },
      },
    } = req;
    const isAvailable = await meetingService.checkMeetingAvailability(slotId);
    if (isAvailable) return next();

    return res.status(CONFLICT).json({
      status: CONFLICT,
      type: 'isFull',
      message: "The meeting you're trying to book is full",
    });
  } catch (error) {
    const err = new Error('Failure to check availability');
    next(err);
  }
}

export async function gatherEventInfo(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const {
      body: {
        recursionId,
        event: { slotId },
      },
    } = req;
    const isManaged = await recursionService.checkIfManage(recursionId);
    const toBeIncluded = isManaged ? 'managee' : 'manager';
    const recursionData = await recursionService.getBookingInfo(recursionId, toBeIncluded);
    const meetingData = await meetingService.getBookingInfo(slotId);
    const hostInfo = await eventService.getHostInfoFromId(meetingData?.event_id);

    req.info = {
      recursion: recursionData as Recursion,
      meeting: meetingData as Meeting,
      host: {
        id: hostInfo?.host as number,
        name: hostInfo?.hostInfo.name as string,
        email: hostInfo?.hostInfo.email as string,
      },
      // @ts-ignore
      gRefreshToken: recursionData ? recursionData[toBeIncluded].gRefreshToken : null,
      toBeIncluded,
    };

    return next();
  } catch (error) {
    console.log(error);
    return next(new Error('Error: failed to gather event info'));
  }
}
