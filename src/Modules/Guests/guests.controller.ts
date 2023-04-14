import { meetingService } from './../Meetings/Meeting.service';
import { recursionService } from './../Recursion/recursion.service';
import { responseService } from './../ResponseT/reponse.service';
import { GoogleCalendar } from './../GCalendar/index';
import { guestsService } from './guest.service';
import { Request, Response } from 'express';
import { OK } from 'http-status';
import db from '../../Database';

class GuestController {
  async removeAttendee(req: Request, res: Response) {
    const {
      params: { guestId },
      body: { id, calmeetId, calendarId, recursionId, host },
      // @ts-ignore
      data: { gRefreshToken },
    } = req;

    // database deletion ops
    await db.transaction(async () => {
      await responseService.deleteResponse(Number(guestId));
      await guestsService.deleteBookMe(Number(guestId));
      await meetingService.incrementLimit(id);
    });

    // fetch remaining users
    const result = await guestsService.findAll({
      where: { meetingId: id },
      attributes: [['name', 'displayName'], 'email'],
    });
    console.log(result);
    // calendar operation
    const calendar = new GoogleCalendar(gRefreshToken);

    if (result.length > 0) {
      await calendar.addUpdates(calendarId, calmeetId, [...result, { email: host }]);
    } else {
      await meetingService.update(id, { calmeetId: null, calendarState: null });
      await calendar.deleteMeeting(calendarId, calmeetId);
    }

    const data = await recursionService.getEventInfo(recursionId);
    return res.status(OK).json({
      status: OK,
      message: 'Guest has been removed successfully',
      data,
    });
  }
}

export default new GuestController();
