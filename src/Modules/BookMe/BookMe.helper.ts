import { addDays, differenceInDays, format, subMonths } from 'date-fns';
import { GoogleCalendar } from '../GCalendar';
import { calendar_v3 } from 'googleapis';
import Schema$Event = calendar_v3.Schema$Event;
import Params$Resource$Events$List = calendar_v3.Params$Resource$Events$List;

export interface IAvalability {
  timeMin: string;
  timeMax: string;
  timeZone: string;
  items: { id: string };
}

export interface IDatesList {
  start: Date | string | null | undefined;
  end: Date | string | null | undefined;
  title?: string;
  id?: number;
}

export interface BookMeInfo {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  startTime: Date | string;
  endTime: Date | string;
  calendarId: string;
  colorId: number;
  user: {
    gRefreshToken: string;
    name: string;
  };
  color: {
    background: string;
    foreground: string;
  };
  calendar: {
    calendarId: string;
    summary: string;
  };
}

export const generateDateArray = (
  start: string,
  end: string,
  timeZone: string,
  calendarId: { id: string },
  currentDate: string,
): IAvalability[] => {
  const dates: IAvalability[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push({
      timeMin: addDays(new Date(start), i).toISOString(),
      timeMax: addDays(new Date(end), i).toISOString(),
      timeZone,
      items: calendarId,
    });
  }

  return dates;
};

export const generateCalendarObject = async (
  calendarId: string,
  calendar: GoogleCalendar,
  options?: Params$Resource$Events$List,
): Promise<IDatesList[] | undefined> => {
  let calendarObj: IDatesList[] | undefined = [];

  // fetch the list form google
  const eventItems: Schema$Event[] | undefined = (await calendar.getCalendarEvents(calendarId, options)).items;

  calendarObj = eventItems?.map((event: Schema$Event, index: number) => {
    return {
      id: index + 1,
      start: new Date(event.start?.dateTime as string),
      end: new Date(event.end?.dateTime as string),
    };
  });

  return calendarObj;
};

// generate a busy event list
const buildDateDifference = (
  date: string | Date,
  time: { startTime: string | Date; endTime: string | Date },
): { timeMin: Date; timeMax: Date } => {
  const formatted: string = format(new Date(date), 'YYY,MM,dd');
  const startTm: string = format(new Date(time.startTime), 'HH,mm');
  const endTm: string = format(new Date(time.endTime), 'HH,mm');
  // @ts-ignore
  const start: Date = new Date(...[...formatted.split(','), ...startTm.split(',')]);
  // @ts-ignore
  const end: Date = new Date(...[...formatted.split(','), ...endTm.split(',')]);
  return { timeMin: subMonths(start, 1), timeMax: subMonths(end, 1) };
};

export const buildBusyEventList = async (bookMe: BookMeInfo, timeZone: string) => {
  const {
    startDate,
    endDate,
    endTime,
    startTime,
    calendar: { calendarId },
    user: { gRefreshToken },
  } = bookMe;
  const days = differenceInDays(new Date(endDate), new Date(startDate));
  const calendar = new GoogleCalendar(gRefreshToken);
  let eventList: IDatesList[] = [];

  for (let i = 0; i <= days; i++) {
    const date = addDays(new Date(startDate), i);
    const result = buildDateDifference(date, { startTime, endTime });
    const list = await calendar.checkAvailability(
      calendarId,
      result.timeMin.toISOString(),
      result.timeMax.toISOString(),
      timeZone,
    );

    if (list.calendars) {
      // @ts-ignore
      eventList = [...eventList, ...list.calendars[calendarId].busy];
    }
  }

  return eventList;
};

export const bookASlot = async (bookMe: BookMeInfo, body: any) => {
  const {
    colorId,
    user: { gRefreshToken },
  } = bookMe;
  const calendar = new GoogleCalendar(gRefreshToken);
  return await calendar.createEvent({
    from: { time: body.startTime },
    to: { time: body.endTime },
    colorId: String(colorId),
    description: `<b>Reason:</b><br/>${body.reason}`,
    location: '',
    summary: `BookMe: ${body.name}`,
    calendarId: bookMe.calendar.calendarId,
    guests: [{ email: body.email }],
  });
};
