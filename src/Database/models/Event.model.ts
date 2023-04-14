import { Table, PrimaryKey, Column, ForeignKey, Model, BelongsTo, HasMany } from 'sequelize-typescript';
import User from './User.model';
import Duration from './Duration.model';
import Meeting from './Meeting.model';
import Recursion from './Recursion.model';

export interface IEvent {
  id: string;
  duration: number;
  recursionId: string;
  host: number;
}

@Table({
  tableName: 'events',
  paranoid: true,
  timestamps: true,
})
export default class Event extends Model<IEvent> {
  @PrimaryKey
  @Column
  id: string;

  @ForeignKey(() => Duration)
  @Column
  duration: number;

  @ForeignKey(() => Recursion)
  @Column
  recursionId: string;

  @ForeignKey(() => User)
  @Column
  host: number;

  @BelongsTo(() => Duration)
  time: Duration;

  @BelongsTo(() => Recursion, { foreignKey: 'recursionId', targetKey: 'id', as: 'hostData' })
  recursion: Recursion;

  @BelongsTo(() => User)
  hostInfo: User;

  @HasMany(() => Meeting, { sourceKey: 'id', hooks: true, onDelete: 'CASCADE' })
  meetings: Meeting[];
}
