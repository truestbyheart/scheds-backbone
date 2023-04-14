/* eslint-disable no-undef */
import { config } from 'dotenv';
import { calendar_v3, google } from 'googleapis';
import { nanoid } from 'nanoid';
import Params$Resource$Freebusy$Query = calendar_v3.Params$Resource$Freebusy$Query;
import Schema$Events = calendar_v3.Schema$Events;
import Schema$Event = calendar_v3.Schema$Event;
import Params$Resource$Events$List = calendar_v3.Params$Resource$Events$List;
import Params$Resource$Events$Insert = calendar_v3.Params$Resource$Events$Insert;
import { IZoomLinkOutput } from '../Manages/manages.service';
import ApiError from '../Shared/helpers/ApiError.helper';

config();
const { OAuth2 } = google.auth;

export enum GCalendarRole {
  none = 'none',
  freeBusyReader = 'freeBusyReader',
  reader = 'reader',
  writer = 'writer',
  owner = 'owner',
}

export enum GCalendarScopeType {
  default = 'default',
  user = 'user',
  group = 'group',
  domain = 'domain',
}

interface CreateEventI {
  from: { time: Date | string; timezone?: string };
  to: { time: Date | string; timezone?: string };
  summary: string;
  location: IZoomLinkOutput | ApiError | null | string;
  description: string;
  colorId: string;
  calendarId: string;
  guests?: { email: string }[];
  status?: string;
  conferenceData?: {
    createRequest: {
      requestId: string;
    };
  };
}

export interface IUpdateEvent {
  summary?: string;
  location?: string;
  description?: string;
  colorId?: string;
}

export class GoogleCalendar {
  private calendar: calendar_v3.Calendar;

  constructor(
    public readonly authOrRefreshToken: string,
    private oAuth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET),
  ) {
    oAuth2Client.setCredentials({
      refresh_token: authOrRefreshToken,
    });

    this.calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  }

  async createEvent({
    from: { time: startTime, timezone: startTz },
    to: { time: endTime, timezone: endTz },
    summary,
    colorId,
    description,
    location,
    calendarId,
    guests,
    status = 'confirmed',
  }: CreateEventI) {
    let event: Schema$Event = {
      summary,
      location: location as string,
      description,
      colorId,
      start: {
        dateTime: startTime as string,
        timeZone: startTz,
      },
      end: {
        dateTime: endTime as string,
        timeZone: endTz,
      },
      attendees: guests,
      status,
    };

    if (location && !(location instanceof ApiError)) {
      event.location = location.link as string;
    } else {
      event.location = '';
      event = {
        ...event,
        conferenceData: {
          createRequest: {
            requestId: nanoid(),
          },
        },
      };
    }
    const { data } = await this.calendar.events.insert({
      calendarId,
      sendUpdates: 'all',
      conferenceDataVersion: 1,
      requestBody: {
        ...event,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 15 },
            { method: 'popup', minutes: 10 },
          ],
        },
      },
    } as Params$Resource$Events$Insert);

    return data;
  }

  async getAllCalendarsList() {
    return (await this.calendar.calendarList.list({ minAccessRole: 'writer' })).data.items;
  }

  async createCalendar(summary: string) {
    return (
      await this.calendar.calendars.insert({
        requestBody: { summary },
      })
    ).data;
  }

  async addUserToCalendar(
    calendarId: string,
    role: GCalendarRole,
    scopeType: GCalendarScopeType,
    email: string,
    sendNotifications: boolean,
  ) {
    await this.calendar.acl.insert({
      calendarId,
      sendNotifications,
      requestBody: {
        role,
        scope: {
          type: scopeType,
          value: email,
        },
      },
    });
  }

  async checkAvailability(
    id: string,
    startTime: string,
    endTime: string,
    endTz: string,
  ): Promise<calendar_v3.Schema$FreeBusyResponse> {
    return (
      await this.calendar.freebusy.query({
        resource: {
          timeMin: startTime,
          timeMax: endTime,
          timeZone: endTz,
          items: [{ id }],
        },
      } as Params$Resource$Freebusy$Query)
    ).data;
  }

  async addUpdates(calendarId: string, eventId: string, guests: { email: string | undefined }[]) {
    await this.calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        attendees: guests,
      },
    });
  }

  async addHangoutLink(calendarId: string, eventId: string) {
    await this.calendar.events.patch({
      calendarId,
      eventId,
      conferenceDataVersion: 1,
      requestBody: {
        conferenceData: {
          createRequest: {
            requestId: nanoid(),
          },
        },
      },
    });
  }

  async deleteMeeting(calendarId: string, calmeetId: string) {
    await this.calendar.events.delete({ calendarId, eventId: calmeetId });
  }

  async getColors() {
    return await this.calendar.colors.get();
  }

  async getCalendarEvents(calendarId: string, options?: Params$Resource$Events$List): Promise<Schema$Events> {
    return (
      await this.calendar.events.list({
        calendarId,
        ...options,
      })
    ).data;
  }

  async deleteCalendarEvents(calendarId: string, eventId: string) {
    return await this.calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all',
    });
  }

  async updateEventDetails(calendarId: string, calmeetId: string, event: IUpdateEvent) {
    return await this.calendar.events.patch({
      calendarId,
      eventId: calmeetId,
      sendUpdates: 'all',
      requestBody: {
        ...event,
      },
    });
  }

  async moveCalendarEvent(calendarId: string, eventId: string, destinationCalendarId: string): Promise<Schema$Event> {
    return (
      await this.calendar.events.move({
        calendarId,
        eventId,
        destination: destinationCalendarId,
      })
    ).data;
  }
}
