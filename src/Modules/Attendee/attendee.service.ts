import { BaseService } from '../Shared/base.service';
import Attendee, { IAttendee } from '../../Database/models/Attendee.model';
import database from '../../Database';
import User from '../../Database/models/User.model';

class AttendeeService extends BaseService<Attendee, number> {
  constructor(attendee = database.getRepository(Attendee)) {
    super(attendee);
  }

  async createAttendee(attendee: IAttendee): Promise<IAttendee> {
    const createdAttendee = await this.model.create<Attendee>(attendee);
    return createdAttendee.get() as Attendee;
  }

  async updateAttendeeMeeting(user_id: number, current_meeting_id: number, new_meeting_id: number): Promise<any> {
    return this.model.update(
      { meeting_id: new_meeting_id },
      {
        where: {
          user_id,
          meeting_id: current_meeting_id,
        },
      },
    );
  }

  async getAttendeesList(id: number) {
    return await this.findManyByProp({ prop: 'meeting_id', value: id }, [{ model: User, attributes: ['email'] }]);
  }

  async checkIfAttending(meetingId: number, userId: number) {
    const isAttending = await this.model.findOne({ where: { meeting_id: meetingId, user_id: userId } });
    return isAttending !== null;
  }

  async deleteAttendee(meeting_id: number, user_id: number) {
    return this.model.destroy({ where: { meeting_id, user_id }, force: true });
  }
}

export const attendeeService = new AttendeeService();
