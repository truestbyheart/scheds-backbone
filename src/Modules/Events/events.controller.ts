import { Request, Response, NextFunction } from 'express';
import { NOT_FOUND, OK } from '../Shared/helpers/status.codes';
import { recursionService } from '../Recursion/recursion.service';
import { GoogleCalendar } from '../GCalendar';
import { generateCalendarLinks } from '../Shared/helpers/calendarLink.generator';
import db from '../../Database';
import { IMeetingUpdate, meetingService } from '../Meetings/Meeting.service';
import { guestsService } from '../Guests/guest.service';
import ResponseT from '../../Database/models/Response.model';
import { runInBackground } from '../../config/bull.config';
import { v4 as uuid } from 'uuid';
import { emailWorker } from '../Shared/workers/email.worker';
import { ISender } from '../Shared/Mailer';
import { FRONTEND_URL } from '../../config/config';
import { meetingLinkService } from '../meetingLinks/meetingLinks.service';
import ApiError from '../Shared/helpers/ApiError.helper';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import { IZoomLinkOutput } from '../Manages/manages.service';
import { generateZoomLink, IZoomPayload } from './events.helper';

export interface IEventArray {
  host: string;
  time: {
    from: Date;
    to: Date;
  };
  meetings: {
    limit: number;
    time: {
      from: Date;
      to: Date;
    };
  }[];
}

export default class EventsController {
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { id },
      } = req;

      const event = await recursionService.getRecursionFullRoute(id);
      if (event === null) return res.status(NOT_FOUND).json({ status: NOT_FOUND, message: 'Event not found' });

      return res.status(OK).json(event);
    } catch (e) {
      return next(e);
    }
  }

  async bookEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        body: { recursionId, user, answers = [], guests = [] },
        info,
      } = req;
      // create google calendar instance
      const calendar = new GoogleCalendar(info.gRefreshToken as string);
      let calObj: any;
      let zoomOutput: IZoomLinkOutput | ApiError | null = null;
      let html = '';

      // Build the description html calendar body
      const rescheduleLink = `${FRONTEND_URL}/client/meeting/reschedule?meeting_id=${info.meeting.id}&event_id=${info.meeting.event_id}&`;
      const cancelLink = `${FRONTEND_URL}/client/cancel/meeting/${info.meeting.event_id}/${info.meeting.id}`;

      if (info.recursion.location === 'zoom') {
        const payload: IZoomPayload = {
          id: info.recursion.creator,
          details: {
            title: info.recursion.title,
            description: info.recursion.description,
          },
          meeting: {
            from: info.meeting.time.from,
            to: info.meeting.time.to,
          },
        };

        if (info.recursion.manageeId) {
          payload.management = { manager: info.recursion.creator, managee: info.recursion.manageeId };
        }

        zoomOutput = await generateZoomLink(payload);
        if (zoomOutput instanceof ApiError) {
          return next(zoomOutput);
        }
        html = `<div><b>Event title:</b> ${info.recursion.title}</div><div><b>Description:</b>${info.recursion.description}</br></br><div><b>Zoom Meeting Link: ${zoomOutput.link}</b></div></div></div><div><b>Assigned to you by:</b> <a href="mailTo:${info.host.email}">${info.host.email}</a></div><div><b><a href="${rescheduleLink}">Reschedule here</a></b> | <b><a href="${cancelLink}">Cancel here</a></b></div>`;
      } else {
        html = `<div><b>Event title:</b> ${info.recursion.title}</div><div><b>Description:</b>${info.recursion.description}</div><div><b>Assigned to you by:</b> <a href="mailTo:${info.host.email}">${info.host.email}</a></div><div><b><a href="${rescheduleLink}">Reschedule here</a></b> | <b><a href="${cancelLink}">Cancel here</a></b></div>`;
      }

      if (info.meeting.calendarState === null || info.meeting.calendarState.trim().length === 0) {
        calObj = await calendar.createEvent({
          from: { time: info.meeting.time.from },
          to: { time: info.meeting.time.to },
          colorId: String(Number(info.recursion.color.id)),
          description: html,
          location: zoomOutput,
          summary: info.recursion.title,
          calendarId: info.recursion.calendar.calendarId as string,
          guests: [{ email: info.host.email }, { email: user.email }],
          status: 'confirmed',
        });

        await db.transaction(async () => {
          const meetObj = {
            calendarState: 'created',
            limit: info.meeting.limit - 1,
            calmeetId: calObj.id,
            linkId: 0,
          };

          if (!zoomOutput) {
            const { id: linkId } = await meetingLinkService.storeLink({
              link: calObj.hangoutLink,
            });
            meetObj.linkId = linkId;
          } else if (!(zoomOutput instanceof ApiError)) {
            meetObj.linkId = zoomOutput.id;
          }

          // update the meeting state and limit
          await meetingService.updateMeeting(info.meeting.id, meetObj);

          // create new guest
          const g = await guestsService.createGuest({
            email: user.email,
            name: user.name,
            meetingId: info.meeting.id,
            recursionId,
          });

          // store the response
          await Promise.all(
            answers.map(async (ans: any) => {
              await ResponseT.create({ responder: g.id, question_id: ans.id, answer: ans.answer });
            }),
          );
        });
      } else {
        const updatedGuest = [...info.recursion.guests, { email: info.host.email }, { email: user.email }];
        await calendar.addUpdates(info.recursion.calendar.calendarId, info.meeting.calmeetId, updatedGuest);

        await db.transaction(async () => {
          // update the meeting limit
          calObj = await meetingService.updateMeeting(info.meeting.id, { limit: info.meeting.limit - 1 });

          // create new guest
          const g = await guestsService.createGuest({
            email: user.email,
            name: user.name,
            meetingId: info.meeting.id,
            recursionId,
            calMeetId: info.meeting.calmeetId,
          });

          // store the response
          await Promise.all(
            answers.map(async (ans: any) => {
              await ResponseT.create({ responder: g.id, question_id: ans.id, answer: ans.answer });
            }),
          );
        });
      }

      // invitees
      const invitees: ISender[] = [];
      guests.map((guest: { email: string }) => {
        invitees.push({ sender: user.email, receiver: guest.email });
      });

      runInBackground({
        taskId: uuid(),
        data: {
          guests: invitees,
          title: info.recursion.title,
          description: info.recursion.description,
          // @ts-ignore
          photoUrl: info.recursion[info.toBeIncluded].photoUrl,
          slot: info.meeting.time,
          user,
          meeting: { recursionId, meetingId: info.meeting.id },
        },
        consumerFn: {
          className: emailWorker,
          method: 'sendFriendlyInvitation',
        },
      });

      let hangLink = '';
      if (zoomOutput) {
        hangLink = zoomOutput.link;
      } else {
        hangLink = calObj.hangoutLink ? calObj.hangoutLink : calObj.meetingLink.link;
      }

      const calendarLinks = await generateCalendarLinks(
        info.meeting.time,
        info.recursion.title,
        info.recursion.description,
        hangLink as string,
      );

      return res.status(OK).json({
        status: OK,
        message: 'Response successfully recorded',
        calendarLinks,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async getEventInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { id },
        query: { mode },
      } = req;
      const event =
        mode === 'edit' ? await recursionService.getEventDetails(id) : await recursionService.getEventInfo(id);
      if (event === null) return res.status(NOT_FOUND).json({ status: NOT_FOUND, message: 'Event not found' });

      return res.status(OK).json(event);
    } catch (error) {
      return next(new ApiError(INTERNAL_SERVER_ERROR, 'Server Cant Fetch Event Info', false, error));
    }
  }
}

export const eventsController = new EventsController();
