import { meetingService } from '../Meetings/Meeting.service';
import { FRONTEND_URL } from '../../config/config';
import { GoogleCalendar } from '../GCalendar/index';
import { guestsService } from '../Guests/guest.service';
import { meetingLinkService } from '../meetingLinks/meetingLinks.service';
import { generateCalendarLinks, ICalendar } from '../Shared/helpers/calendarLink.generator';
import db from '../../Database';

export interface CalendarGuests {
  name: string;
  email: string;
}

export interface CalendarTime {
  from: string | Date;
  to: string | Date;
}

export interface CreateUpdateCalendar {
  info: {
    title: string;
    description: string;
  };
  guests: CalendarGuests[];
  time: CalendarTime;
  calmeetId: string | undefined;
  hostEmail: string;
  event_id: string | undefined;
  meeting_id: number;
  user_email: string;
  user_name?: string;
  colorId: string;
  calendarId: string;
  currentLinkId: number;
}

export interface Meeting {
  id: number;
  limit: number;
  calmeetId: string | null;
  time: CalendarTime;
}

export interface Event {
  duration: number;
  time: CalendarTime;
  meetings: Meeting[];
  hasBooked: boolean;
}

export interface Recursion {
  id: string;
  title: string;
  description: string;
  color: {
    id: number;
    background: string;
  };
  events: Event[];
}

export async function createAndUpdateAttendee(
  calendar: GoogleCalendar,
  data: CreateUpdateCalendar,
): Promise<ICalendar> {
  const rescheduleLink = `${FRONTEND_URL}/client/meeting/reschedule?meeting_id=${data.meeting_id}&event_id=${data.event_id}&`;
  const cancelLink = `${FRONTEND_URL}/client/cancel/meeting/${data.event_id}/${data.meeting_id}`;

  // if (data.guests.length === 0) {
  const calObj = await calendar.createEvent({
    from: { time: data.time.from },
    to: { time: data.time.to },
    colorId: data.colorId,
    description: `<div><b>Event title:</b> ${data.info.title}</div><div><b>Description:</b>${data.info.description}</div><div><b>Assigned to you by:</b> <a href="mailTo:${data.hostEmail}">${data.hostEmail}</a></div><div><b><a href="${rescheduleLink}">Reschedule here</a></b> | <b><a href="${cancelLink}">Cancel here</a></b></div>`,
    location: '',
    summary: `${data.info.title}`,
    calendarId: data.calendarId,
    guests: [{ email: data.user_email }, ...data.guests],
  });

  await db.transaction(async () => {
    await guestsService.createGuest({
      name: data.user_name,
      email: data.user_email,
      meetingId: data.meeting_id,
    });

    // store the new Hangout link in the meeting service Link
    const { id: linkId } = await meetingLinkService.storeLink({
      link: calObj.hangoutLink as string,
    });

    await meetingLinkService.deleteLink(data.currentLinkId);

    await meetingService.decrementLimit(data.meeting_id);
    await meetingService.updateMeeting(data.meeting_id, {
      calendarState: 'created',
      calmeetId: calObj.id,
      linkId,
    });
  });

  const calendarLinks = await generateCalendarLinks(
    data.time,
    data.info.title,
    data.info.description,
    calObj.hangoutLink as string,
  );

  return calendarLinks;
  // } else {
  //   // const new_email = [...booked, { email: user_email }, { email: eventDetails.user.email }];
  //   // await calendar.addUpdates(eventDetails.calendar.id as string, new_calmeet_id, new_email);
  //   // await attendeeService.updateAttendeeMeeting(user_id, current_meeting_id, new_meeting_id);
  //   // await meetingService.updateMeeting(new_meeting_id, { limit: new_meeting_limit - 1 });
  //   // await meetingService.updateMeeting(current_meeting_id, { limit: current_meeting_limit + 1 });
  // }
}

export async function clientMeetingResponseBuilder(result: string) {
  const response: Recursion[] = [];
  JSON.parse(result).data.map((meeting: any) => {
    const isDuplicate = response.findIndex((el) => el.id === meeting.recursionId);

    if (isDuplicate === -1) {
      response.push({
        id: meeting.recursionId,
        title: meeting.recursion.title,
        description: meeting.recursion.description,
        color: meeting.recursion.color,
        events: meeting.recursion.events.map((evt: any) => {
          return {
            duration: evt.duration,
            time: { ...evt.time },
            meetings: evt.meetings.map((meet: any) => {
              return {
                id: meet.id,
                limit: meet.limit,
                calmeetId: meet.calmeetId,
                hasBooked: meet.id === meeting.meetingId ? true : false,
                time: meet.time,
              };
            }),
          };
        }),
      });
    } else {
      response[isDuplicate].events.map((evt: any) => {
        return {
          duration: evt.duration,
          time: { ...evt.time },
          meetings: evt.meetings.map((meet: any) => {
            return {
              id: meet.id,
              limit: meet.limit,
              calmeetId: meet.calmeetId,
              hasBooked: meet.id === meeting.meetingId ? true : false,
              time: meet.time,
            };
          }),
        };
      });
    }
  });
  // console.log(JSON.stringify(response, null, 2));
  return response;
}
