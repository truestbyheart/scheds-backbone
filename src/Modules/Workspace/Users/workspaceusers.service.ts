import { BaseService } from '../../Shared/base.service';
import WorkspaceUser, { IWorkspaceUser } from '../../../Database/models/workspace-users.model';
import database from '../../../Database';
import User from '../../../Database/models/User.model';
import Workspace from '../../../Database/models/workspace.model';

class WorkspaceUsersService extends BaseService<WorkspaceUser, string> {
  constructor(workspaceUsers = database.getRepository(WorkspaceUser)) {
    super(workspaceUsers);
  }

  async createWorkspacUser(data: IWorkspaceUser) {
    return this.model.create(data);
  }

  async getWorkspaceMembers(workspaceId: string) {
    return this.findManyByProp({ prop: 'workspaceId', value: workspaceId }, [
      {
        model: User,
        attributes: ['name', 'email', 'photoUrl'],
      },
    ]);
  }

  async deleteWorkspaceUser(userId: number, workspaceId: string) {
    return this.model.destroy({ where: { userId, workspaceId }, force: true });
  }

  async checkMemberExistence(userId: number, workspaceId: string) {
    return (await this.model.findOne({ where: { userId, workspaceId } })) !== null;
  }

  async getUsersWorkspaces(userId: number, page: number, limit: number) {
    return this.getPaginated({
      page,
      limit,
      defaultOptions: {
        where: {
          userId,
        },
        include: [
          {
            model: Workspace,
            attributes: ['id', 'name', 'description', 'owner'],
          },
        ],
        subQuery: true,
      },
    });
  }

  updateUserRole(userId: number, body: { role: string }) {
    return this.model.update(body, { where: { userId } });
  }

  async countJoinedGroups(userId: number): Promise<number> {
    return (await this.model.count({ where: { userId } })) as number;
  }
}

export const workspaceUsersService = new WorkspaceUsersService();
