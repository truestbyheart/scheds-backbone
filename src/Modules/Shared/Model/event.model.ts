import { ICalendarTime, MeetingModel } from './meeting.model';
import { TimeUpdatePayload } from './recursion.model';
import { QuestionComponentResponse } from './question.model';

export interface DurationI {
  id?: number;
  startTime: Date;
  endTime: Date;
}

export interface ICalender {
  id: string;
  summary: string;
}

export interface IEventDetails {
  title: string;
  description: string;
  location: string;
  calendar: ICalender;
  managed: boolean;
  zoomDetails?: {
    manager: number;
    managee: number;
  };
  colorId: number;
}

export interface IManipulatedEventArray {
  recursionId?: string;
  event?: IEvent[];
  removed?: { timeId: number; event_id: string; reason?: string }[];
  questions?: IQuestionData[];
  rmQn?: { qnId: number }[];
  section?: string;
}

export interface IQuestionData {
  id?: number;
  qnId?: number;
  inquiry?: string;
  eventId?: string;
}

export interface IRecursionResult {
  data: {
    totalEvents: number;
    totalGuest: number;
    title: string;
    updatedAt: string;
    email: string;
    background: string;
  };
  pageMeta: {
    count: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface IEvent {
  details?: IEventDetails;
  events?: (MeetingModel | IBackEndEvent)[];
  questions?: IQuestionData[];
}

export interface IUpdateEvent {
  details?: IEventDetails;
  events?: IBackEndEvent[];
  questions?: IQuestionData[];
}

export interface ISortedEvent {
  date: Date;
  eventList: IBackEndEvent[];
}

export interface ICreateEvent {
  date: Date;
  eventList: MeetingModel[];
}

export interface IBackEndDuration {
  time: IBackEndTime;
}
export interface IBackEndMeeting extends IBackEndDuration {
  id?: number;
  limit?: number;
  calmeetId?: string;
}

export interface IBackEndTime {
  id?: number;
  from: Date;
  to: Date;
}

export interface IBackEndUserInfo {
  id: number;
  email: string;
  photoUrl: string;
}

export interface IBackEndEvent {
  index?: number;
  id?: string;
  duration?: number;
  host?: number;
  time: IBackEndTime;
  limit?: number;
  hostInfo?: IBackEndUserInfo;
  meetings: (IBackEndMeeting | ICalendarTime)[];
}

export interface IEventData {
  id: string;
  title: string;
  description: string;
  totalEvents: string;
  events: IBackEndEvent[];
  questions: { id: number; inquiry: string }[];
}

export interface IEventInfoData {
  id: string;
  title: string;
  description: string;
  colorId?: number;
  totalEvents: string;
  totalGuest: string;
  totalMeeting: string;
  events: IBackEndEvent[];
  managedId: number | null;
  linkId: number | null;
  questions: { id: number; inquiry: string }[];
  managee: { id: number; name: string; email: string } | null;
  calendar: {
    calendarId: string;
    summary: string;
  };
  color: {
    background: string;
  };
  booked: {
    id: number;
    calendarState: string;
    calmeetId: string;
    time: {
      from: Date | string;
      to: Date | string;
    };
    event: {
      id: string;
      time: {
        from: Date | string;
        to: Date | string;
      };
    };
  };
}

export interface IEventSubmit {
  title: string;
  description: string;
  calendar: ICalender;
  location: string;
  colorId: number;
  managed: boolean;
  zoomDetails?: {
    manager: number;
    managee: number;
  };
}

export interface IEventSubmitUpdate {
  title?: string;
  description?: string;
  calendar?: ICalender;
  location?: string;
  colorId?: number;
  managed?: boolean;
  zoomDetails?: {
    manager: number;
    managee: number;
  };
}

export interface ClientEventData {
  status: number;
  data: IEventInfoData;
}

export interface EventUpdatePayload {
  details: IEventSubmitUpdate;
  time: TimeUpdatePayload;
  questions?: QuestionComponentResponse;
}
