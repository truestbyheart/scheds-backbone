import { GoogleCalendar } from '../../GCalendar';
import async from 'async';

export interface ICalendarWorker {
  gRefreshToken: string;
  calendarId: string;
  events: {
    meeting_id: number;
    calmeetId: string;
  }[];
}

export async function calendarClearance(payload: ICalendarWorker) {
  const { gRefreshToken, events, calendarId } = payload;
  const calendar = new GoogleCalendar(gRefreshToken);
  await async.each(events, (event, callback) => {
    try {
      calendar.deleteMeeting(calendarId as string, event.calmeetId);
    } catch (e) {
      callback();
    }
  });
}
