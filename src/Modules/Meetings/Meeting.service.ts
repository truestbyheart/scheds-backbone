import { BaseService } from '../Shared/base.service';
import Meeting, { IMeeting } from '../../Database/models/Meeting.model';
import database from '../../Database';
import Duration from '../../Database/models/Duration.model';
import Event from '../../Database/models/Event.model';
import { Op } from 'sequelize';
import MeetingLinks from '../../Database/models/MeetingLinks.model';

export interface IMeetingUpdate {
  id?: number;
  event_id?: string;
  limit?: number;
  duration?: number;
  calendarState?: string;
  calmeetId?: string;
  linkId?: number;
  initialLimit?: number;
}

export default class MeetingService extends BaseService<Meeting, number> {
  constructor(meeting = database.getRepository(Meeting)) {
    super(meeting);
  }

  async createMeeting(meeting: IMeeting): Promise<IMeeting> {
    const createdMeeting = await this.model.create<Meeting>(meeting);
    return createdMeeting.get() as Meeting;
  }

  async findMeetingById(id: number) {
    return await this.findById(
      id,
      [
        {
          model: Duration,
          attributes: ['from', 'to'],
        },
        {
          model: Event,
          attributes: ['id'],
          include: [
            {
              model: Duration,
              attributes: ['from', 'to'],
            },
          ],
        },
      ],
      ['id', 'calendarState', 'calmeetId'],
    );
  }

  async updateMeeting(id: number, data: any) {
    await this.update(id, data);
    return this.findOneByProp({ prop: 'id', value: id }, [{ model: MeetingLinks, attributes: ['link'] }]);
  }

  async checkMeetingAvailability(meeting_id: number) {
    const isAvailable = await this.model.findOne({ where: { id: meeting_id, limit: { [Op.gt]: 0 } } });
    return isAvailable !== null;
  }

  async getBookingInfo(meetingId: number): Promise<Meeting | null> {
    return this.findOneByProp(
      { prop: 'id', value: meetingId },
      [
        { model: Duration, attributes: ['from', 'to'] },
        { model: MeetingLinks, attributes: ['link'] },
      ],
      ['id', 'calendarState', 'calmeetId', 'limit', 'event_id'],
    );
  }

  incrementLimit(meetingId: number) {
    return this.model.findOne({ where: { id: meetingId } }).then((meeting) => {
      meeting?.increment('limit');
    });
  }

  decrementLimit(meetingId: number) {
    return this.model.findOne({ where: { id: meetingId } }).then((meeting) => {
      meeting?.decrement('limit');
    });
  }

  getCalMeetId(meetingId: number) {
    return this.model.findOne({
      where: { id: meetingId },
      attributes: ['calmeetId', 'event_id', 'linkId'],
    });
  }

  async getEventCalMeetIds(eventId: string): Promise<string[]> {
    return await this.findManyByProp({ prop: 'event_id', value: eventId }, [], ['calmeetId']).then((meetings) => {
      return meetings.map((meeting) => meeting.calmeetId);
    });
  }

  async getEventMeetings(eventId: string): Promise<number[]> {
    return await this.findManyByProp({ prop: 'event_id', value: eventId }, [], ['id']).then((meetings) => {
      return meetings.map((meeting) => meeting.id);
    });
  }

  deleteMeetingUsingEventId(eventId: string) {
    return this.model.destroy({ where: { event_id: eventId } });
  }

  getEventMeetingWithCalMeetIds(event_id: string): Promise<string[]> {
    return this.model
      .findAll({ where: { event_id, calmeetId: { [Op.ne]: null } }, attributes: ['calmeetId'] })
      .then((meetings) => {
        return meetings.map((meeting) => meeting.calmeetId);
      });
  }

  patchCalMeetId(id: string, calmeetId: string) {
    return this.model.update({ calmeetId }, { where: { calmeetId: id } });
  }
}

export const meetingService = new MeetingService();
