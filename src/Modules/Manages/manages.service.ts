import { IProfileInfo } from '../Users/user.controller';
import { createZoomMeeting, IZoomMeeting } from '../Zoom/zoom.helper';
import { BaseService } from '../Shared/base.service';
import Manage, { IManage } from '../../Database/models/Manage.model';
import database, { User } from '../../Database';
import { meetingLinkService } from '../meetingLinks/meetingLinks.service';

export interface IZoomLinkOutput {
  id: number;
  link: string;
}

class ManagesService extends BaseService<Manage, string> {
  constructor(manages = database.getRepository(Manage)) {
    super(manages);
  }

  async generateManageeMeetingLink(
    manager: number,
    managee: number,
    data: IZoomMeeting,
  ): Promise<IZoomLinkOutput | null> {
    // check if the user is managed by the creator of the meeting
    const IsManaged = await this.model.findOne({
      where: { manager, managee },
    });

    if (!IsManaged) return null;
    const zoomLink = (await createZoomMeeting(managee, data)).zoomMeetingLink;
    const meeting = await meetingLinkService.storeLink({
      link: zoomLink,
    });

    return {
      id: meeting?.id,
      link: meeting?.link,
    };
  }

  async generateMeetingLink(creator: number, data: IZoomMeeting): Promise<IZoomLinkOutput | null> {
    const zoomlink = (await createZoomMeeting(creator, data)).zoomMeetingLink;
    const meeting = await meetingLinkService.storeLink({
      link: zoomlink,
    });

    return {
      id: meeting?.id,
      link: meeting?.link,
    };
  }

  async createManager(where: any, account: IManage): Promise<{ isNew: boolean; manager: IManage }> {
    const [createdManager, isNew] = await this.model.findOrCreate({ where, defaults: account });
    return { manager: createdManager, isNew };
  }

  async getManageeList(id: number, limit: number, page: number) {
    return this.getPaginated({
      defaultOptions: {
        where: { manager: id },
        include: [{ model: User, as: 'controlled', attributes: ['id', 'name', 'email', 'photoUrl'] }],
        attributes: ['id', 'manager', 'managee'],
        subQuery: true,
      },
      limit: limit || 12,
      page: page || 1,
    });
  }

  async countManagedBy(userId: number): Promise<number> {
    return (await this.model.count({ where: { managee: userId } })) as number;
  }

  async countManage(userId: number): Promise<number> {
    return (await this.model.count({ where: { manager: userId } })) as number;
  }

  async getUserManagers(userId: number) {
    return (await this.findManyByProp({ prop: 'managee', value: userId }, [
      {
        model: User,
        attributes: ['name', 'email', 'photoUrl'],
        as: 'controlled',
      },
    ])) as unknown as IProfileInfo['managedBy'];
  }
}

export const managesService = new ManagesService();
