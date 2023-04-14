import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript';
import User from './User.model';
import Recursion from './Recursion.model';

export interface IWorkspace {
  id: string;
  name: string;
  description?: string;
  owner: number;
}

@Table({
  tableName: 'workspaces',
  timestamps: true,
  paranoid: true,
})
export default class Workspace extends Model<IWorkspace> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  @Column
  name: string;

  @Column
  description: string;

  @ForeignKey(() => User)
  @Column
  owner: number;

  @BelongsTo(() => User)
  admin: User;

  @HasMany(() => Recursion)
  recursions: Recursion[];
}
