import { compareAsc } from 'date-fns';
import { BaseService } from '../Shared/base.service';
import { IBookMe } from '../../Database/models/BookMe.model';
import BookMe from '../../Database/models/BookMe.model';
import database, { User } from '../../Database';
import Colors from '../../Database/models/Colors.model';
import { guestsService } from '../Guests/guest.service';
import { calendarModelService } from '../CalendarModel/CalendarModel.service';
import CalendarModel from '../../Database/models/Calendar.model';

export interface IBookMeDetails {
  id: string;
  calmeetId: string;
  name: string;
  email: string;
  startTime: string;
  endTime: string;
}

export interface BookMeRequestBody extends IBookMe {
  calendar: {
    id: string;
    summary: string;
  };
}

// @ts-ignore
class BookMeService extends BaseService<BookMe, string> {
  constructor(bookme = database.getRepository(BookMe)) {
    super(bookme);
  }

  async createBookMe(body: BookMeRequestBody) {
    const { calendar } = await calendarModelService.createCalendar({
      calendarId: body.calendar.id,
      summary: body.calendar.summary,
    });

    return await this.model.create({
      ...body,
      calendarId: calendar.id,
    });
  }

  async getBookMe(bookme_id: string) {
    return await this.findOneByProp(
      { prop: 'id', value: bookme_id },
      [
        { model: User, attributes: ['gRefreshToken', 'name'] },
        { model: Colors, attributes: ['background'] },
        { model: CalendarModel, attributes: ['calendarId', 'summary'] },
      ],
      ['id', 'title', 'startDate', 'endDate', 'startTime', 'endTime', 'colorId', 'location', 'slotSize'],
    );
  }

  async getBookMeList(user_id: number, page: number, limit: number): Promise<any> {
    const result = await this.getPaginated({
      page: Number(page),
      limit: Number(limit),
      defaultOptions: {
        where: { user_id },
        include: [
          { model: Colors, attributes: ['background', 'foreground'] },
          { model: CalendarModel, attributes: ['calendarId', 'summary'] },
        ],
        attributes: ['id', 'title', 'startDate', 'endDate', 'calendarId'],
        subQuery: true,
      },
    });

    const outcome = [];
    for (let j = 0; j < result.data.length; j++) {
      const count = await guestsService.countBookIns(result.data[j].id);
      outcome.push({ ...result.data[j], bookins: count });
    }

    return { data: outcome, pageMeta: result.pageMeta };
  }

  async getBookMeFullDetails(bookme_id: string) {
    const currentDate = new Date();
    const bk = await this.getBookMe(bookme_id);
    const bookins: IBookMeDetails[] = await guestsService.getBookInList(bookme_id);
    const users: { name: string; email: string }[] = await guestsService.getBookInUsers(bookme_id);

    // data blocks
    let upcoming: IBookMeDetails[] = [];
    let today: IBookMeDetails[] = [];
    let past: IBookMeDetails[] = [];

    for (let j = 0; j < bookins.length; j++) {
      if (compareAsc(new Date(bookins[j].startTime), currentDate) === 1) {
        upcoming = [...upcoming, bookins[j]];
      } else if (compareAsc(new Date(bookins[j].startTime), currentDate) === 0) {
        today = [...today, bookins[j]];
      } else if (compareAsc(new Date(bookins[j].startTime), currentDate) === -1) {
        past = [...past, bookins[j]];
      }
    }

    return { details: bk, data: { upcoming, today, past, users } };
  }

  async deleteBookMe(bookmeId: string) {
    this.model.destroy({ where: { id: bookmeId } });
    await guestsService.deleteBookInGuests(bookmeId);
    return;
  }

  async updateBookme(bookmeId: string, data: any) {
    this.model.update({ ...data, slotSize: data.slotSize }, { where: { id: bookmeId } });
  }
}

export default new BookMeService();
