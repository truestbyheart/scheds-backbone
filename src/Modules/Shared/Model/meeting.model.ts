import { DurationI } from './event.model';
import { AnswerModel } from './question.model';
import { PageMeta } from './pageMeta.model';
import { ICalendar } from './Calendar.model';
import { IAPIError } from './Error.model';

export interface ICalendarTime {
  from: string | Date;
  to: string | Date;
  limit?: number;
}

export interface IMeet extends DurationI {
  limit?: number;
}

export interface MeetingModel {
  index?: number;
  duration?: DurationI;
  host?: string;
  limit?: number;
  meetings?: IMeet[];
}

export interface BookingModel {
  recursionId: string;
  user: { email: string; name: string };
  answers: AnswerModel[];
  guests: { email: string }[];
  event: {
    id: string;
    host: number;
    slotId: number;
  };
}

export interface ClientMeetingData {
  recursionId: string;
  attending: string;
  recursion: {
    title: string;
    color: {
      background: string;
    };
  };
}

export interface ClientMeeting {
  status?: number;
  data: ClientMeetingData[];
  PageMeta?: PageMeta;
}

export interface IRescheduleData {
  current_meeting: {
    meeting_id: number;
    calmeet_id: string;
  };
  new_meeting: {
    id: number;
    time: ICalendarTime;
  };
  user_email: string;
  recursion_id: string;
  current_event_id?: string;
  new_event_id: string;
}

export interface IRescheduleHTTPResponse {
  status: number;
  data: {
    message: string;
    calendarLinks: ICalendar;
  };
}

export interface IRescheduleHTTPError extends IAPIError {
  calendarLinks: ICalendar;
}

export interface ClientMeetingRequest {
  meeting_id?: string;
  event_id?: string;
  q?: string;
}
