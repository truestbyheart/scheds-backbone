import { meetingService } from '../Meetings/Meeting.service';
import { recursionService } from '../Recursion/recursion.service';
import { GoogleCalendar } from '../GCalendar';
import { guestsService } from '../Guests/guest.service';
import { responseService } from '../ResponseT/reponse.service';
import { differenceInMinutes } from 'date-fns';
import { IZoomMeeting } from '../Zoom/zoom.helper';
import { managesService, IZoomLinkOutput } from '../Manages/manages.service';
import ApiError from '../Shared/helpers/ApiError.helper';
import { BAD_REQUEST } from 'http-status';

export interface IZoomPayload {
  id: number;
  management?: {
    manager: number;
    managee: number;
  };
  details: {
    title: string;
    description: string;
  };
  meeting: {
    from: string | Date;
    to: string | Date;
  };
}

export const eventDeletionPreCleanup = async (eventId: string, recursionId: string) => {
  // 1. remove all calendar event and delete meetings
  const calmeetIds = await meetingService.getEventCalMeetIds(eventId);
  const meetingIds = await meetingService.getEventMeetings(eventId);
  const gRefreshToken = await recursionService.getRecursionRefreshToken(recursionId);
  const calendarId = await recursionService.getCalendarIdFromRecursionId(recursionId);
  const calendar = new GoogleCalendar(gRefreshToken as string);

  await Promise.all([
    calmeetIds.map(async (calmeetId) => {
      await calendar.deleteCalendarEvents(calendarId as string, calmeetId);
    }),
    meetingIds.map(async (meetingId) => {
      const guestIds = await guestsService.getGuestIdsFromMeetingId(meetingId);
      await Promise.all(
        guestIds.map(async (guestId) => {
          await responseService.deleteResponse(guestId);
          await guestsService.deleteGuestBasedOnMeetingId(meetingId);
        }),
      );
    }),
  ]);
};

export const generateZoomLink = async (data: IZoomPayload): Promise<IZoomLinkOutput | ApiError> => {
  let link: IZoomLinkOutput | null;
  const meetingDuration = differenceInMinutes(new Date(data.meeting.to), new Date(data.meeting.from));
  const meetingPayload: IZoomMeeting = {
    topic: data.details.title,
    start_time: new Date(data.meeting.from).toISOString(),
    duration: meetingDuration,
    type: 2,
    password: `connect123`,
    agenda: data.details.description,
  };

  if (data.management) {
    link = await managesService.generateManageeMeetingLink(
      data.management.manager,
      data.management.managee,
      meetingPayload,
    );
  } else {
    link = await managesService.generateMeetingLink(data.id, meetingPayload);
  }

  if (link === null) {
    return new ApiError(BAD_REQUEST, 'Error: failed to create a zoom meeting link', true);
  }

  return link;
};
