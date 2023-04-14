import { questionService } from './../Questions/question.service';
import { calendarModelService } from './../GCalendar/gCalendar.service';
import { BaseService, PagedResult } from '../Shared/base.service';
import Recursion, { IRecursion } from '../../Database/models/Recursion.model';
import database from '../../Database';
import Duration from '../../Database/models/Duration.model';
import Event from '../../Database/models/Event.model';
import Meeting from '../../Database/models/Meeting.model';
import Question from '../../Database/models/Question.model';
import User from '../../Database/models/User.model';
import CalendarModel from '../../Database/models/Calendar.model';
import Guest from '../../Database/models/Guest.model';
import { include } from './recursion.includes';
import { Op, fn, col } from 'sequelize';
import Colors from '../../Database/models/Colors.model';
import MeetingLinks from '../../Database/models/MeetingLinks.model';
import ResponseT from '../../Database/models/Response.model';
import { guestsService } from '../Guests/guest.service';
import { eventService } from '../Events/events.service';
import Manage from '../../Database/models/Manage.model';
import { IUpdateRecursion } from '../Shared/Model/recursion.model';

export interface IPageMeta {
  totalPages: number;
  limit: number;
  page: number;
  count: number;
}

export interface IDuration {
  from: string | Date;
  to: string | Date;
}

export interface IMeeting {
  id: number;
  limit: number;
  calmeetId: string | null;
  time: IDuration;
}

export interface IEvent {
  id: string;
  host: number;
  duration: number;
  hostInfo: {
    email: string;
  };
  time: IDuration;
  meetings: IMeeting;
}
export interface IEventInfo {
  id: string;
  title: string;
  description: string;
  manageeId: string | null;
  worksapceId: string | null;
  colorId: number;
  linkId: number;
  events: IEvent[];
}

// @ts-ignore
export default class RecursionService extends BaseService<Recursion, string> {
  constructor(recursion = database.getRepository(Recursion)) {
    super(recursion);
  }

  private defaultInclude = [
    {
      model: Event,
      attributes: ['id', 'creator', 'colorId', 'duration'],
      include: [
        {
          model: Duration,
          attributes: ['id', 'from', 'to'],
        },
        {
          model: Meeting,
          include: [
            {
              model: Duration,
              attributes: ['id', 'from', 'to'],
            },
            {
              model: User,
              attributes: ['id', 'email'],
            },
          ],
        },
        {
          model: CalendarModel,
          attributes: ['calendarId', 'summary'],
        },
      ],
    },
    {
      model: Question,
      attributes: ['id', 'recursionId', 'inquiry'],
    },
  ];

  async createRecursion(data: IRecursion) {
    return this.model.create(data);
  }

  async getOne(recursionId: string) {
    // @ts-ignore
    return this.findOneByProp({ prop: 'id', value: recursionId }, [...this.defaultInclude]);
  }

  async getRecursionFullRoute(recursionId: string) {
    return this.model.findOne({
      where: { id: recursionId },
      attributes: ['id', 'title', 'description', [fn('COUNT', col('events.id')), 'totalEvents']],
      include: [
        {
          model: Event,
          attributes: ['id', 'host', 'duration'],
          include: [
            { model: User, attributes: ['id', 'email', 'photoUrl'] },
            { model: Duration, attributes: ['id', 'from', 'to'] },
            {
              model: Meeting,
              where: { limit: { [Op.gt]: 0 } },
              attributes: ['id', 'limit'],
              include: [{ model: Duration, attributes: ['id', 'from', 'to'] }],
              required: false,
            },
          ],
        },
        {
          model: Question,
          attributes: ['id', 'inquiry'],
        },
      ],
      group: [
        'events.recursionId',
        'events.id',
        'events->hostInfo.id',
        'events->time.id',
        'Recursion.id',
        'events->meetings.id',
        'events->meetings->time.id',
        'questions.id',
      ],
    });
  }

  async getPaginateRecursions(creator: number, limit: number, page: number, q: string | undefined) {
    let where: any = { creator, workspaceId: null };
    if (q) where = { ...where, [Op.or]: [{ title: { [Op.iLike]: '%' + q + '%' } }] };
    // get pageMeta data
    const pageMeta = await this.generatePageMeta(page, limit, where);
    const result = await this.model.findAll({
      where,
      attributes: ['id', 'title', 'updatedAt'],
      include: [
        { model: Colors, attributes: ['background'] },
        {
          model: Event,
          attributes: ['id'],
          include: [
            {
              model: User,
              attributes: ['email'],
            },
          ],
        },
      ],
    });

    let fullData: any[] = [];

    for (let i = 0; i < result.length; i++) {
      const attendees = (await guestsService.countRecursionGuests(result[i].id))[0];
      const events = (await eventService.countEvents(result[i].id))[0];

      // @ts-ignore
      fullData = [
        ...fullData,
        {
          // @ts-ignore
          ...result[i].dataValues,
          // @ts-ignore
          attendees: Number(attendees.dataValues.attendees),
          // @ts-ignore
          events: Number(events.dataValues.totalEvents),
          // @ts-ignore
          hostInfo: result[i].dataValues.events[0].hostInfo.dataValues,
        },
      ];
    }

    return { data: fullData, pageMeta };
  }

  async getWorkspaceRecursion(limit: number, page: number, workspaceId: string): Promise<any> {
    return this.getPaginated({
      limit,
      page: Number(page),
      defaultOptions: {
        where: {
          workspaceId,
        },
        include: include.minimalInclude,
        subQuery: true,
      },
    });
  }

  async getBookingInfo(recursionId: string, toBeIncluded = 'manager'): Promise<Recursion | null> {
    return this.findOneByProp(
      { prop: 'id', value: recursionId },
      [
        { model: CalendarModel, attributes: ['calendarId'] },
        { model: Colors, attributes: ['id'] },
        { model: MeetingLinks, attributes: ['link'] },
        { model: User, as: toBeIncluded, attributes: ['email', 'name', 'photoUrl', 'gRefreshToken'] },
        { model: Guest, attributes: ['email'] },
      ],
      ['title', 'description', 'manageeId', 'location', 'creator'],
    );
  }

  async getEventInfo(recursionId: string): Promise<any> {
    const data = await this.model.findOne({
      where: { id: recursionId },
      attributes: ['id', 'title', 'description', 'manageeId'],
      include: [
        {
          model: Event,
          attributes: ['id', 'host', 'duration'],
          include: [
            { model: User, attributes: ['email'] },
            { model: Duration, attributes: ['from', 'to'] },
            {
              model: Meeting,
              attributes: ['id', 'limit', 'calmeetId'],
              include: [
                { model: Duration, attributes: ['id', 'from', 'to'] },
                {
                  model: Guest,
                  attributes: ['id', 'name', 'email'],
                  include: [
                    {
                      model: ResponseT,
                      attributes: ['answer'],
                      include: [{ model: Question, attributes: ['inquiry'] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Question,
          attributes: ['id', 'inquiry'],
        },
        {
          model: Guest,
          attributes: [],
        },
        { model: MeetingLinks, attributes: ['id', 'link'] },
        // TODO: work on the managee information
        // { model: User, as: 'managee', attributes: ['id', 'name', 'email'] },
        { model: Colors, attributes: ['background'] },
        { model: CalendarModel, attributes: ['calendarId', 'summary'] },
      ],
    });

    const fullData = {
      // @ts-ignore
      ...data.dataValues,
      // @ts-ignore
      totalGuests: Number((await guestsService.countRecursionGuests(recursionId))[0].dataValues.attendees),
      // @ts-ignore
      totalEvents: Number((await eventService.countEvents(recursionId))[0].dataValues.totalEvents),
    };

    return fullData;
  }

  async checkIfManage(recursionId: string): Promise<any> {
    let isManaged = false;
    const result = await this.model.findOne({ where: { id: recursionId }, attributes: ['manageeId'] });
    if (result !== null) {
      isManaged = result.manageeId !== null;
    }
    return isManaged;
  }

  async getWorkspaceRecursions(
    workspaceId: string,
    limit: number,
    page: number,
  ): Promise<{ data: any[]; pageMeta: any }> {
    const where: any = { workspaceId };
    // get pageMeta data
    const pageMeta = await this.generatePageMeta(page, limit, where);
    const result = await this.model.findAll({
      where,
      attributes: ['id', 'title', 'updatedAt'],
      include: [{ model: Colors, attributes: ['background'] }],
    });

    let fullData: any[] = [];

    for (let i = 0; i < result.length; i++) {
      const attendees = (await guestsService.countRecursionGuests(result[i].id))[0];
      const events = (await eventService.countEvents(result[i].id))[0];
      // @ts-ignore
      fullData = [
        ...fullData,
        {
          // @ts-ignore
          ...result[i].dataValues,
          // @ts-ignore
          attendees: attendees.dataValues.attendees,
          // @ts-ignore
          events: events.dataValues.totalEvents,
        },
      ];
    }

    return { data: fullData, pageMeta };
  }

  async isOwner(userId: number, recursionId: string) {
    return (await this.model.findOne({ where: { id: recursionId, creator: userId } })) !== null;
  }

  async deleteRecursion(recursionId: string) {
    // 1.delete event
    await eventService.deleteRecursionEvent(recursionId);
    // 2.delete calendar
    await calendarModelService.deleteRecursionCalendar(recursionId);
    // 3.delete questions
    await questionService.deleteRecursionQn(recursionId);
    // 4. delete guests
    await guestsService.deleteRecursionGuests(recursionId);

    return this.model.destroy({ where: { id: recursionId }, force: true });
  }

  async getRefreshTokenFromRecursionId(recursionId: string): Promise<Recursion | null> {
    return await this.model.findOne({
      where: { id: recursionId },
      attributes: ['title', 'description'],
      include: [
        {
          model: Colors,
          attributes: ['id'],
        },
        {
          model: CalendarModel,
          attributes: ['calendarId'],
        },
        {
          model: User,
          as: 'manager',
          attributes: ['email', 'gRefreshToken'],
        },
        {
          model: Manage,
          attributes: [],
          include: [
            {
              model: User,
              as: 'controlled',
              attributes: ['email', 'gRefreshToken'],
            },
          ],
        },
      ],
    });
  }

  async getEventDetails(recursionId: string): Promise<Recursion | null> {
    return await this.model.findOne({
      where: { id: recursionId },
      attributes: ['id', 'title', 'description', 'manageeId', 'workspaceId', 'colorId', 'linkId', 'location'],
      include: [
        {
          model: Event,
          attributes: ['id', 'host', 'duration'],
          include: [
            { model: User, attributes: ['email'] },
            { model: Duration, attributes: ['from', 'to'] },
            {
              model: Meeting,
              attributes: ['id', 'limit', 'calmeetId', 'linkId'],
              include: [
                { model: Duration, attributes: ['id', 'from', 'to'] },
                { model: MeetingLinks, attributes: ['id', 'link'] },
                // {
                //   model: Guest,
                //   attributes: ['id', 'name', 'email'],
                //   include: [
                //     {
                //       model: ResponseT,
                //       attributes: ['answer'],
                //       include: [{ model: Question, attributes: ['inquiry'] }],
                //     },
                //   ],
                // },
              ],
            },
          ],
        },
        {
          model: Question,
          attributes: ['id', 'inquiry'],
        },
        // {
        //   model: Guest,
        //   attributes: [],
        // },
        { model: MeetingLinks, attributes: ['id', 'link'] },
        { model: Colors, attributes: ['id', 'background'] },
        { model: CalendarModel, attributes: ['calendarId', 'summary'] },
      ],
    });
  }

  updateRecursion(recursionId: string, recursion: IUpdateRecursion) {
    return this.model.update(recursion, { where: { id: recursionId } });
  }

  getCalendarIdFromRecursionId(recursionId: string): Promise<string | null> {
    return this.findOneByProp(
      { prop: 'id', value: recursionId },
      [{ model: CalendarModel, attributes: ['calendarId', 'summary'] }],
      ['calendarId'],
    ).then((recursion) => {
      if (recursion) {
        return recursion.calendar.calendarId;
      }
      return null;
    });
  }

  getRecursionRefreshToken(recursionId: string): Promise<string | null> {
    return this.findOneByProp(
      { prop: 'id', value: recursionId },
      [{ model: User, attributes: ['gRefreshToken'] }],
      ['id'],
    ).then((recursion) => {
      if (recursion) {
        console.log(recursion);
        // @ts-ignore
        return recursion.manager.gRefreshToken;
      }
      return null;
    });
  }

  async countUserRecursions(userId: number): Promise<number> {
    return (await this.model.count({ where: { creator: userId } })) as number;
  }
}

export const recursionService = new RecursionService();
