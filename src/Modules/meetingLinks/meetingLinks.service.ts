import { BaseService } from './../Shared/base.service';
import MeetingLinks, { IMeetingLinks } from '../../Database/models/MeetingLinks.model';
import database from '../../Database';

class MeetingLinkService extends BaseService<MeetingLinks, string> {
  constructor(meetingLink = database.getRepository(MeetingLinks)) {
    super(meetingLink);
  }

  async storeLink(data: IMeetingLinks) {
    return this.model.create({ ...data });
  }

  async deleteLink(linkId: number) {
    return this.model.destroy({ where: { id: linkId }, force: true });
  }
}

export const meetingLinkService = new MeetingLinkService();
