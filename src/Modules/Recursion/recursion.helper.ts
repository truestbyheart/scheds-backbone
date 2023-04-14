import { IEventArray } from '../Events/events.controller';
import { durationService } from '../Durations/duration.service';
import { userService } from '../Users/user.service';
import { UserType } from '../../Database/models/User.model';
import { eventService } from '../Events/events.service';
import { v4 as uuid } from 'uuid';
import { meetingService } from '../Meetings/Meeting.service';
import { recursionService } from './recursion.service';
import { GoogleCalendar, IUpdateEvent } from '../GCalendar';
import { IEventSubmitUpdate } from '../Shared/Model/event.model';
import { calendarModelService } from '../CalendarModel/CalendarModel.service';
import { IUpdateRecursion } from '../Shared/Model/recursion.model';

export const EventBuilder = async (payload: IEventArray[], recursionId: string): Promise<void> => {
  payload.map(async (eventObject: IEventArray) => {
    const {
      time: { from, to },
      host,
    } = eventObject;

    // store duration and get the duration Id
    const durationId = (await durationService.createDuration({ from, to })).id;
    let hostId = await userService.getHostid(host);

    // check if the hostId is null and if so, this mean the host is not a member
    if (hostId === null) {
      // create the user as a guest
      hostId = (await userService.findCreateOrUpdate({ email: host, type: UserType.GUEST }, { email: host })).user.id;
    }

    // create the events
    const eventId = (
      await eventService.createEvent({
        id: uuid(),
        duration: durationId,
        recursionId,
        host: Number(hostId),
      })
    ).id;

    // create meetings
    eventObject.meetings.map(async (meeting: any) => {
      const { from, to } = meeting;
      // store duration and get duration id
      const durId = (await durationService.createDuration({ from, to }))?.id;

      // store meeting data
      await meetingService.createMeeting({
        event_id: eventId,
        limit: meeting.limit,
        duration: Number(durId),
        initialLimit: meeting.limit,
      });
    });
  });
};

export const eventUpdateBuilder = (details: IEventSubmitUpdate): IUpdateEvent => {
  const eventInfo: IUpdateEvent = {};
  if (details.title) eventInfo.summary = details.title;
  if (details.description) eventInfo.description = details.description;
  if (details.colorId) eventInfo.colorId = String(details.colorId);

  return eventInfo;
};

export const recursionUpdateFlow = async (recursionId: string, details: IEventSubmitUpdate) => {
  const gRefreshToken = await recursionService.getRecursionRefreshToken(recursionId);
  const calendarId = await recursionService.getCalendarIdFromRecursionId(recursionId);
  const eventIds = await eventService.getAllRecursionEventIds(recursionId);
  const calendar = new GoogleCalendar(gRefreshToken as string);
  const newCalendarInfo: IUpdateEvent = eventUpdateBuilder(details);

  await Promise.all([
    async () => {
      let newCalendarId: number | null = null;
      if (details.calendar !== undefined) {
        if (details.calendar.id !== calendarId) {
          const {
            calendar: { id },
          } = await calendarModelService.createCalendar({
            calendarId: details.calendar.id,
            summary: details.calendar.summary,
          });

          newCalendarId = id as number;
        }
      }
      const payload: IUpdateRecursion = {
        title: newCalendarInfo.summary,
        description: newCalendarInfo.description,
        colorId: Number(newCalendarInfo.colorId),
      };

      if (newCalendarId !== null) payload.calendarId = newCalendarId as number;
      await recursionService.updateRecursion(recursionId, payload);
    },
    eventIds.map(async (eventId) => {
      const calMeetIds = await meetingService.getEventMeetingWithCalMeetIds(eventId);
      calMeetIds.map(async (calMeetId) => {
        if (details.calendar !== undefined) {
          if (details.calendar.id === calendarId) {
            await calendar.updateEventDetails(calendarId, calMeetId, newCalendarInfo);
          } else {
            const { id } = await calendar.moveCalendarEvent(calendarId as string, calMeetId, details.calendar.id);
            console.log({ newCalMeetId: id });
            await meetingService.patchCalMeetId(calMeetId, id as string);
            await calendar.updateEventDetails(calendarId as string, id as string, newCalendarInfo);
          }
        }
      });
    }),
  ]);
};
