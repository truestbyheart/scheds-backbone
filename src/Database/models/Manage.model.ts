import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import User from './User.model';
export interface IManage {
  id?: number;
  manager: number;
  managee: number;
}

@Table({
  tableName: 'manages',
  timestamps: true,
  paranoid: true,
})
export default class Manage extends Model<IManage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  manager: number;

  @ForeignKey(() => User)
  @Column
  managee: number;

  @BelongsTo(() => User, { foreignKey: 'manager', targetKey: 'id', as: 'controller' })
  user: User;

  @BelongsTo(() => User, { foreignKey: 'managee', targetKey: 'id', as: 'controlled' })
  userx: User;
}
