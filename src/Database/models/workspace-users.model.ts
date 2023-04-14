import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table, BelongsTo } from 'sequelize-typescript';
import User from './User.model';
import Workspace from './workspace.model';

export enum RoleType {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface IWorkspaceUser {
  id?: number;
  userId: number;
  workspaceId: string;
  role?: RoleType;
}

@Table({
  tableName: 'workspaceusers',
  timestamps: true,
  paranoid: true,
})
export default class WorkspaceUser extends Model<IWorkspaceUser> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Workspace)
  @Column
  workspaceId: string;

  @Column
  role: RoleType;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Workspace)
  workspace: Workspace;
}
