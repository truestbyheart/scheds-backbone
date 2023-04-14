import { v4 } from 'uuid';
import {NextFunction, Request, Response} from 'express';
import {NOT_FOUND, OK} from 'http-status';
import bookMeService from './BookMe.service';
import { GoogleCalendar } from '../GCalendar';
import { bookASlot, buildBusyEventList } from './BookMe.helper';
import { guestsService } from '../Guests/guest.service';
import { generateCalendarLinks } from '../Shared/helpers/calendarLink.generator';
import ApiError from "../Shared/helpers/ApiError.helper";

class BookMe {
  async createBookMe(req: Request, res: Response) {
    const {
      body,
      // @ts-ignore
      data: { id: creator },
    } = req;
    console.log(JSON.stringify(req.body, null, 3));

    const id = (await bookMeService.createBookMe({ id: v4(), user_id: creator, ...body }))?.id;
    return res.status(OK).json({
      status: OK,
      message: 'Book me created successfully',
      id,
    });
  }

  async getBookMeCalendarDetails(req: Request, res: Response) {
    // @ts-ignore
    const { bookme, body } = req;

    // initialize calendar
    const result = await buildBusyEventList(bookme, body.timezone);
    return res.status(OK).json({
      status: OK,
      title: bookme.title,
      startDate: bookme.startDate,
      endDate: bookme.endDate,
      endTime: bookme.endTime,
      startTime: bookme.startTime,
      slotSize: bookme.slotSize,
      data: result,
    });
  }

  async bookIn(req: Request, res: Response) {
    const {
      // @ts-ignore
      bookme,
      body,
      params: { bookme_id },
    } = req;

    const calObj = await bookASlot(bookme, body);
    const result = await buildBusyEventList(bookme, body.timezone);

    const calendarLinks = await generateCalendarLinks(
      { from: body.startTime, to: body.endTime },
      `BookMe: ${body.name}`,
      `<b>Reason:</b><br/>${body.reason}`,
      calObj.hangoutLink as string,
    );

    await guestsService.createGuest({
      email: body.email,
      name: body.name,
      reason: body.reason,
      meetingId: null,
      calMeetId: calObj.id,
      bookmeId: bookme_id,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });

    return res.status(OK).json({ status: OK, message: 'You have successfully booked in', data: result, calendarLinks });
  }

  async viewBookIns(req: Request, res: Response, next: NextFunction) {
    const {
      // @ts-ignore
      data: { id },
      query: { page = 1, limit = 12 },
    } = req;

    const result = await bookMeService.getBookMeList(id, Number(page), Number(limit));

    if(result.data.length === 0) return next(new ApiError(NOT_FOUND, "You Currently have no bookmes"));
    return res.status(OK).json({ ...result });
  }

  async bookMeDetails(req: Request, res: Response) {
    const {
      params: { bookme_id },
    } = req;

    const result = await bookMeService.getBookMeFullDetails(bookme_id);
    return res.status(OK).json({ status: OK, result });
  }

  async cancelBookIn(req: Request, res: Response) {
    const {
      body: { calMeetId, calendarId, token, eventId, bookMeId },
    } = req;
    console.log(req.body);
    const calendar = new GoogleCalendar(token);
    const result = await calendar.deleteCalendarEvents(calendarId, calMeetId);
    await guestsService.deleteBookMe(bookMeId);
    console.log(JSON.stringify(result, null, 3));
    const data = await bookMeService.getBookMeFullDetails(eventId);
    return res.status(OK).json({ status: OK, message: 'Bookin canceled successfully', result: data });
  }

  async updateBookMe(req: Request, res: Response) {
    const {
      params: { bookme_id },
      body,
    } = req;
    console.log(JSON.stringify(req.body, null, 3));
    await bookMeService.updateBookme(bookme_id, body);
    return res.status(OK).json({
      status: OK,
      message: 'Bookme has been successfully updated.',
    });
  }

  async deleteBookMe(req: Request, res: Response) {
    const {
      params: { bookme_id },
    } = req;

    await bookMeService.deleteBookMe(bookme_id);
    return res.status(OK).json({
      status: OK,
      message: 'Bookme has been deleted successfully',
    });
  }
}

export default new BookMe();
