import { managesService } from './../Manages/manages.service';
import { workspaceUsersService } from './../Workspace/Users/workspaceusers.service';
/* eslint-disable no-undef */
import { BaseService } from '../Shared/base.service';
import User from '../../Database/models/User.model';
import database from '../../Database';
import { IUser } from '../../Database/models/User.model';
import Meeting from '../../Database/models/Meeting.model';
import Event from '../../Database/models/Event.model';
import Attendee from '../../Database/models/Attendee.model';
import Duration from '../../Database/models/Duration.model';
import { IProfileInfo } from './user.controller';
import { recursionService } from '../Recursion/recursion.service';
import { workspaceService } from '../Workspace/workspace.service';

export default class UserService extends BaseService<User, number> {
  constructor(user = database.getRepository(User)) {
    super(user);
  }

  defaultIncludeList = [
    {
      model: Attendee,
      include: {
        // @ts-ignore
        model: Meeting,
        include: [
          {
            model: Duration,
          },
          {
            model: Event,
            include: [
              {
                model: Duration,
              },
              {
                model: Meeting,
                include: {
                  model: Duration,
                },
              },
            ],
          },
        ],
      },
    },
  ];

  async findUserByEmail(email: string, isProfile: boolean): Promise<IProfileInfo> {
    const info: IProfileInfo = {
      userInfo: null,
      analytics: {
        recursions: 0,
        workspaces: 0,
        member: 0,
        managedBy: 0,
        manages: 0,
      },
      managedBy: [],
    };
    info.userInfo = await this.findOneByProp(
      { prop: 'email', value: email },
      [],
      ['id', 'email', 'provider', 'type', 'name', 'photoUrl'],
    );

    if (isProfile && info.userInfo) {
      info.analytics.recursions = await recursionService.countUserRecursions(info.userInfo?.id as number);
      info.analytics.workspaces = await workspaceService.countUserWorkspaces(info.userInfo?.id as number);
      info.analytics.member = await workspaceUsersService.countJoinedGroups(info.userInfo?.id as number);
      info.analytics.managedBy = await managesService.countManagedBy(info.userInfo?.id as number);
      info.analytics.manages = await managesService.countManage(info.userInfo?.id as number);

      info.managedBy = await managesService.getUserManagers(info.userInfo?.id as number);
    }

    return info;
  }

  async checkIfUser(email: string) {
    return (await this.model.findOne({ where: { email, type: 'user' } })) !== null;
  }

  async findCreateOrUpdate(user: IUser, where: any): Promise<{ isNew: boolean; user: User }> {
    let isUpdate = false;
    let updatedUser;

    const [createdUser, isNew] = await this.model.findOrCreate({
      where,
      defaults: user,
    });

    if (user.type === 'user') {
      if (createdUser?.provider === null || createdUser?.gRefreshToken === null || createdUser?.photoUrl === null) {
        await this.model.update(user, { where: { email: user.email } });
        updatedUser = await this.model.findOne({ where: { email: user.email } });
        isUpdate = true;
      }
    }

    // update the user refresh token
    await this.model.update({ gRefreshToken: user.gRefreshToken }, { where: { email: user.email } });

    return {
      isNew,
      user: isUpdate ? (updatedUser as User) : (createdUser.get() as User),
    };
  }

  async getUserDetails(id: number) {
    return this.model.findOne({ where: { id } });
  }

  async getHostid(email: string) {
    const user = await this.model.findOne({ where: { email } });
    return user?.id ? user?.id : null;
  }

  async getUserInfo(id: number) {
    return this.findOneByProp({ prop: 'id', value: id }, [], ['name', 'email', 'photoUrl']);
  }

  async getRefreshToken(id: number) {
    return this.findOneByProp({ prop: 'id', value: id }, [], ['gRefreshToken']);
  }
}

export const userService = new UserService();
