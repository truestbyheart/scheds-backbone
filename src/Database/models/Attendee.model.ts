import { Table, Column, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Base } from '../base';
import User from './User.model';
import Meeting from './Meeting.model';

export interface IAttendee {
  user_id: number;
  id?: number;
  meeting_id: number;
}

@Table({
  tableName: 'attendees',
  paranoid: true,
  timestamps: true,
})
export default class Attendee extends Base<Attendee> implements IAttendee {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  user_id: number;

  @ForeignKey(() => Meeting)
  @Column
  meeting_id: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Meeting)
  meeting: Meeting;
}
