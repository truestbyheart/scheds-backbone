import { BaseService } from '../Shared/base.service';
import Event, { IEvent } from '../../Database/models/Event.model';
import database from '../../Database';
import User from '../../Database/models/User.model';
import Duration from '../../Database/models/Duration.model';
import Meeting from '../../Database/models/Meeting.model';
import CalendarModel from '../../Database/models/Calendar.model';
import Recursion from '../../Database/models/Recursion.model';
import { col, fn } from 'sequelize';
import { calendarModelService } from '../CalendarModel/CalendarModel.service';
import { recursionService } from '../Recursion/recursion.service';
import { TimeUpdatePayload } from '../Shared/Model/recursion.model';
import { EventBuilder } from '../Recursion/recursion.helper';
import { IEventArray } from './events.controller';
import { eventDeletionPreCleanup } from './events.helper';

// @ts-ignore
export default class EventService extends BaseService<Event, string> {
  constructor(event = database.getRepository(Event)) {
    super(event);
  }

  async createEvent(event: IEvent): Promise<IEvent> {
    const createdEvent = await this.model.create<Event>(event);
    return createdEvent.get() as Event;
  }

  async updateEvent(eventId: string, data: any) {
    return this.update(eventId, data);
  }

  async getRecursionInfoUsingEventId(id: string) {
    const result = await this.findById(id, [], ['recursionId']);
    console.log(result);
    if (result) {
      return await recursionService.getEventInfo(result.recursionId);
    }

    return null;
  }

  async getEventWithCalendarDetails(event_id: string, meeting_id: number) {
    return await this.findById(event_id, [
      {
        model: Meeting,
        attributes: ['host'],
        where: {
          id: meeting_id,
        },
        include: [
          {
            model: User,
            attributes: ['email'],
          },
          {
            model: Duration,
            attributes: ['from', 'to'],
          },
        ],
      },
      {
        model: CalendarModel,
        attributes: ['calendarId', 'summary'],
      },
      {
        model: User,
        attributes: ['gRefreshToken', 'email', 'name'],
      },
      {
        model: Recursion,
        attributes: ['title', 'description'],
      },
    ]);
  }

  async deleteEvent(id: string) {
    return this.model.destroy({ where: { id } });
  }

  async getCreatorRefreshToken(event_id: string) {
    const refresh = await this.findOneByProp(
      { prop: 'id', value: event_id },
      [
        {
          model: User,
          attributes: ['name', 'email'],
        },
        {
          model: Recursion,
          attributes: ['id', 'creator'],
          include: [
            {
              model: User,
              attributes: ['gRefreshToken'],
            },
          ],
        },
      ],
      ['id', 'recursionId', 'host'],
    );

    const cal = await calendarModelService.getCalendarInfoFromRecursionId(refresh?.recursionId as string);

    return {
      // @ts-ignore
      user: { gRefreshToken: refresh?.hostData.manager.gRefreshToken },
      host: {
        id: refresh?.host,
        name: refresh?.hostInfo.name,
        email: refresh?.hostInfo.email,
      },
      calendar: { calendarId: cal?.calendarId },
    };
  }

  countEvents(recursionId: string) {
    return this.model.findAll({
      where: { recursionId },
      attributes: [[fn('COUNT', col('recursionId')), 'totalEvents']],
    });
  }

  deleteRecursionEvent(recursionId: string) {
    return this.model.destroy({ where: { recursionId }, force: true });
  }

  getHostFromRecursionId(recursionId: string) {
    return this.model.findOne({
      where: { recursionId },
      attributes: ['host'],
      include: [
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });
  }

  getHostInfoFromId(eventId: string | undefined): Promise<Event | null> {
    return this.findOneByProp(
      { prop: 'id', value: eventId },
      [{ model: User, attributes: ['name', 'email'] }],
      ['host'],
    );
  }

  async updateRecursionEvents({ toBeRemoved, toBeAdded }: TimeUpdatePayload, recursionId: string) {
    await Promise.all([
      toBeRemoved?.map(async (el) => {
        await eventDeletionPreCleanup(el, recursionId);
        await this.model.destroy({ where: { id: el }, force: true });
      }),
      EventBuilder(toBeAdded as IEventArray[], recursionId),
    ]);
  }

  getAllRecursionEventIds(recursionId: string): Promise<string[]> {
    return this.findManyByProp({ prop: 'recursionId', value: recursionId }, [], ['id']).then((events) =>
      events.map((event) => event.id),
    );
  }
}

export const eventService = new EventService();
