import Guest, { IGuest } from '../../Database/models/Guest.model';
import { BaseService } from '../Shared/base.service';
import { fn, col, Op } from 'sequelize';
import database from '../../Database';
import { IBookMeDetails } from '../BookMe/BookMe.service';
import { Sequelize } from 'sequelize';
import Recursion from '../../Database/models/Recursion.model';
import Colors from '../../Database/models/Colors.model';

export default class GuestsService extends BaseService<Guest, string> {
  constructor(guest = database.getRepository(Guest)) {
    super(guest);
  }

  async checkGuestExistance(options: { email: string; id: number }) {
    const exists = await this.model.findOne({ where: { meetingId: options.id, email: options.email } });
    return exists !== null;
  }

  getGuests(meetingId: number, user_email?: string) {
    return this.model.findAll({
      where: { meetingId, email: { [Op.not]: user_email } },
      attributes: ['email'],
    });
  }

  async createGuest(payload: IGuest) {
    return this.model.create({ ...payload });
  }

  async countGuests(recursionId: string): Promise<any[]> {
    return this.model.findAll({ where: { recursionId }, attributes: [[fn('COUNT', col('Guest.id')), 'totalGuest']] });
  }

  async countBookIns(bookmeId: string) {
    return this.model.count({ where: { bookmeId: bookmeId } });
  }

  async getBookInList(bookmeId: string): Promise<IBookMeDetails[] | any> {
    return this.findManyByProp(
      { prop: 'bookmeId', value: bookmeId },
      [],
      ['id', 'calMeetId', 'name', 'email', 'startTime', 'endTime', 'reason'],
    );
  }

  async deleteBookMe(guestId: number) {
    return this.model.destroy({ where: { id: guestId }, force: true });
  }

  deleteBookInGuests(bookme_id: string) {
    return this.model.destroy({ where: { bookmeId: bookme_id }, force: true });
  }

  getBookInUsers(bookmeId: string) {
    return this.model.findAll({
      where: { bookmeId: bookmeId },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('email')), 'email'], 'name'],
    });
  }

  countRecursionGuests(recursionId: string) {
    return this.model.findAll({
      where: { recursionId },
      attributes: [[Sequelize.fn('COUNT', Sequelize.col('recursionId')), 'attendees']],
    });
  }

  deleteRecursionGuests(recursionId: string) {
    return this.model.destroy({ where: { recursionId }, force: true });
  }

  async findGuestList(email: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const result = await this.model.findAll({
      where: { email, bookmeId: null },
      attributes: ['recursionId', [Sequelize.fn('count', Sequelize.col('recursionId')), 'attending']],
      include: [
        {
          model: Recursion,
          attributes: ['title'],
          include: [
            {
              model: Colors,
              attributes: ['background'],
            },
          ],
        },
      ],
      group: ['recursionId', 'recursion.id', 'recursion.title', 'recursion->color.id', 'recursion->color.background'],
      limit,
      offset,
    });

    if (result.length === 0) {
      return {
        data: result,
      };
    }

    // TODO: make sure when we count and group by recursion Id
    const count = await this.model.count({ where: { email, bookmeId: null }, group: ['email'] });

    // @ts-ignore
    const totalPages = Math.ceil(Number(count[0].count) / limit) || 1;
    const currentPage = page ? page : 1;

    return {
      data: result,
      pageMeta: {
        totalPages,
        limit,
        page: currentPage,
      },
    };
  }

  async getMeetingIdList(email: string, recursionId: string): Promise<Guest[]> {
    return await this.model.findAll({
      where: {
        email,
        recursionId,
      },
      attributes: ['meetingId'],
    });
  }

  async isAttending(email: string, meetingId: number): Promise<boolean> {
    return (await this.model.findOne({ where: { email, meetingId } })) !== null;
  }

  async deleteGuestFromParams(meetingId: string, email: string) {
    return await this.model.destroy({ where: { email, meetingId } });
  }

  deleteGuestBasedOnMeetingId(meetingId: number) {
    return this.model.destroy({ where: { meetingId } });
  }

  getGuestIdsFromMeetingId(meetingId: number): Promise<number[]> {
    return this.model.findAll({ where: { meetingId } }).then((guests) => {
      return guests.map((guest) => guest.id);
    });
  }
}

export const guestsService = new GuestsService();
