import { BaseService } from '../Shared/base.service';
import Workspace, { IWorkspace } from '../../Database/models/workspace.model';
import database from '../../Database';
import User from '../../Database/models/User.model';
import { workspaceUsersService } from './Users/workspaceusers.service';
import { recursionService } from '../Recursion/recursion.service';

// @ts-ignore
class WorkspaceService extends BaseService<Workspace, string> {
  constructor(workspace = database.getRepository(Workspace)) {
    super(workspace);
  }

  async createWorkspace(data: IWorkspace) {
    return this.model.create(data);
  }

  async getWorkspaceDetail(workspaceId: string, limit: number, page: number) {
    const workspaceInfo = await this.findOneByProp({ prop: 'id', value: workspaceId }, [
      {
        model: User,
        attributes: ['name', 'photoUrl', 'email'],
      },
    ]);

    const workspaceMember = await workspaceUsersService.getWorkspaceMembers(workspaceId);
    const workspaceRecursion = await recursionService.getWorkspaceRecursions(workspaceId, limit, page);

    return {
      details: workspaceInfo,
      members: workspaceMember,
      recursions: workspaceRecursion.data,
      pageMeta: workspaceRecursion.pageMeta,
    };
  }

  async isWorkspaceAdmin(workspaceId: string, userId: number) {
    return (await this.model.findOne({ where: { id: workspaceId, owner: userId } })) !== null;
  }

  async getDescription(workspaceId: string): Promise<string | undefined> {
    return (await this.model.findOne({ where: { id: workspaceId } }))?.description;
  }

  async countUserWorkspaces(userId: number): Promise<number> {
    return (await this.model.count({ where: { owner: userId } })) as number;
  }
}

export const workspaceService = new WorkspaceService();
