/* eslint-disable no-undef */
import { CalendarEvent, google, outlook, yahoo, ics } from 'calendar-link';
import differenceInMinutes from 'date-fns/differenceInMinutes';

export interface ICalendar {
  google: string;
  yahoo: string;
  outlook: string;
  ics: string;
}

export async function generateCalendarLinks(
  slot: { from: string | Date; to: string | Date },
  title: string,
  description: string,
  location?: string,
): Promise<ICalendar> {
  try {
    const duration = differenceInMinutes(new Date(slot.to), new Date(slot.from));

    const event: CalendarEvent = {
      title,
      description,
      start: slot.from,
      duration: [duration, 'm'],
    };

    if (location) event.location = location;

    return {
      google: google(event),
      outlook: outlook(event),
      yahoo: yahoo(event),
      ics: ics(event),
    };
  } catch (error) {
    throw { message: `Can't populate calendar links`, error };
  }
}
