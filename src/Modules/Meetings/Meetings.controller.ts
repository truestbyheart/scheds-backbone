import { NextFunction, Request, Response } from 'express';
import { NOT_FOUND, OK } from 'http-status';
import Guest from '../../Database/models/Guest.model';
import { eventService } from '../Events/events.service';
import { GoogleCalendar } from '../GCalendar';
import { guestsService } from '../Guests/guest.service';
import { recursionService } from '../Recursion/recursion.service';
import { createAndUpdateAttendee } from './meeting.helper';
import { meetingService } from './Meeting.service';
import { ICalendar } from '../Shared/helpers/calendarLink.generator';
import ApiError from '../Shared/helpers/ApiError.helper';

export interface IMeetingRequest extends Request {
  list?: Guest[];
}

class MeetingsController {
  async getClientMeetings(req: Request, res: Response): Promise<void> {
    const {
      query: { page = 1, limit = 12 },
      body: { email },
    } = req;
    console.log(req.body);
    const result = await guestsService.findGuestList(email, Number(page), Number(limit));

    if (result.data.length === 0) {
      res.status(NOT_FOUND).json({
        status: NOT_FOUND,
        message: 'You have no Upcoming meetings',
      });
      return;
    }

    res.status(OK).json({
      status: OK,
      data: result.data,
      PageMeta: result.pageMeta,
    });
  }

  async getRecursionDetails(req: IMeetingRequest, res: Response): Promise<void> {
    const {
      params: { email, recursion_id },
    } = req;
    // retrieve a list of meetingId the client is attending
    const list = await guestsService.getMeetingIdList(email, recursion_id);
    // retrieve recursion details
    const recursion = await recursionService.getEventDetails(recursion_id);

    // tag booked meetings
    const data = recursion?.events.map((event: any) => {
      event.meetings.map((meet: any) => {
        const exists = list.findIndex((f: any) => f.meetingId === meet.id);
        meet.dataValues.hasBooked = exists > -1 ? true : false;
        return meet;
      });
      return event;
    });

    // pick necessary properties for response
    const response = {
      id: recursion?.id,
      title: recursion?.title,
      description: recursion?.description,
      color: recursion?.color,
      events: data,
    };

    res.status(OK).json({
      status: OK,
      data: response,
    });
  }

  /**
   * @description will receive the current meeting
   * @param req
   * @param res
   */
  async rescheduleMeeting(req: Request, res: Response): Promise<any> {
    const {
      body: {
        current_meeting: { meeting_id },
        new_meeting: { id, time },
        cal: {
          rec_info: { title, description },
          client_auth: { gRefreshToken },
          host_info: { hostId, name, email },
          event_calendar: {
            calendar_id,
            current_meeting_calmeetId,
            new_meeting_calmeetId,
            color_id,
            current_meeting_linkId,
          },
        },
        user_email,
        new_event_id,
      },
    } = req;

    const calendar = new GoogleCalendar(gRefreshToken);
    let calendarLinks: ICalendar = { google: '', ics: '', outlook: '', yahoo: '' };
    console.log(req.body);

    // get all the guests from the current and new meeting excluding the client from the current meeting
    const current_meeting_guest = await guestsService.getGuests(meeting_id, user_email);
    const new_meeting_guest = await guestsService.getGuests(id);

    /*
     * check if the current meeting excluding the client is empty
     * if the current meeting will be empty (has no guest) remove it from the calendar and update the limit by 1
     */
    if (current_meeting_guest.length === 0) {
      await calendar.deleteCalendarEvents(calendar_id, current_meeting_calmeetId);
      await meetingService.incrementLimit(meeting_id);
      await meetingService.updateMeeting(meeting_id, {
        calendarState: null,
        calmeetId: null,
      });

      calendarLinks = await createAndUpdateAttendee(calendar, {
        info: {
          title,
          description,
        },
        time,
        hostEmail: email,
        calendarId: calendar_id,
        user_email,
        calmeetId: new_meeting_calmeetId,
        event_id: new_event_id,
        colorId: color_id,
        guests: [
          ...new_meeting_guest,
          {
            name,
            email,
          },
        ],
        meeting_id: id,
        currentLinkId: current_meeting_linkId,
      });
    }

    return res.status(OK).json({
      status: OK,
      data: {
        message: 'Rescheduled Successfully',
        calendarLinks,
      },
    });
  }

  /**
   * @author Daniel Mwangila
   * @description This method handles the cancellation process
   * @param req
   * @param res
   */
  async cancelMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
    const {
      body: { email, meetingId, eventId },
    } = req;

    // Get google refresh token
    const {
      user: { gRefreshToken },
      calendar: { calendarId },
      host: { email: hostEmail },
    } = await eventService.getCreatorRefreshToken(eventId);

    const calendar = new GoogleCalendar(gRefreshToken as string);

    // STEP 2: Check  if the user is attending the meeting
    const isAttending = await guestsService.isAttending(email, meetingId);

    // STEP 3: If the user is not attending respond.
    if (!isAttending) {
      return next(
        new ApiError(
          NOT_FOUND,
          'The email provide is not attending the meeting. or the meeting has been moved.',
          false,
        ),
      );
    }

    // STEP 4: If the user is attending the meeting get the calendar meeting Id.
    // @ts-ignore
    const { calmeetId } = await meetingService.getCalMeetId(meetingId);
    const attendees = await guestsService.getGuests(meetingId, email);
    console.log(attendees);

    // STEP 5: If there is only one attendee, we delete the meeting and update the limit and remove the calmeetid
    if (attendees.length === 0) {
      await calendar.deleteMeeting(calendarId as string, calmeetId);
      await meetingService.incrementLimit(meetingId);
      await meetingService.updateMeeting(meetingId, {
        calendarState: null,
        calmeetId: null,
      });
      await guestsService.deleteGuestFromParams(meetingId, email);
    } else {
      let guests: { email: string | undefined }[] = [];
      guests = attendees.map((at: any) => {
        console.log(at.email);
        return { email: at.email };
      });
      console.log(guests);
      guests = [...guests, { email: hostEmail }];
      await calendar.addUpdates(calendarId as string, calmeetId, guests);
      await meetingService.incrementLimit(meetingId);
      await guestsService.deleteGuestFromParams(meetingId, email);
    }

    res.status(OK).json({
      status: OK,
      message: 'Successfully Canceled/removed you from the meeting',
    });
  }

  async getMeetingDetails(req: Request, res: Response, next: NextFunction) {
    const {
      params: { event_id, meeting_id },
    } = req;

    const result = await eventService.getRecursionInfoUsingEventId(event_id);

    if (result === null) {
      return next(new ApiError(NOT_FOUND, 'Event Not Found', false));
    }

    const booked = await meetingService.findMeetingById(Number(meeting_id));
    result.booked = booked;

    return res.status(OK).json({
      status: OK,
      data: result,
    });
  }
}

export default new MeetingsController();
