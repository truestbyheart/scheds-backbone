import { Table, PrimaryKey, Column, ForeignKey, AutoIncrement, BelongsTo, HasMany } from 'sequelize-typescript';
import { Base } from '../base';
import Duration from './Duration.model';
import Event from './Event.model';
import Guest from './Guest.model';
import MeetingLinks from './MeetingLinks.model';

export enum MeetingType {
  ONE = 'one-one',
  ONEMANY = 'one-many',
}
export interface IMeeting {
  id?: number;
  event_id: string;
  limit: number;
  duration: number;
  calendarState?: string;
  calmeetId?: string;
  linkId?: number;
  initialLimit?: number;
}

@Table({
  tableName: 'meetings',
  paranoid: true,
  timestamps: true,
})
export default class Meeting extends Base<Meeting> implements IMeeting {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Event)
  @Column({ field: 'event_id' })
  event_id: string;

  @ForeignKey(() => Duration)
  @Column
  duration: number;

  @Column
  limit: number;

  @Column
  calendarState: string;

  @Column
  calmeetId: string;

  @ForeignKey(() => MeetingLinks)
  @Column
  linkId: number;

  @Column
  initialLimit: number;

  @BelongsTo(() => Duration)
  time: Duration;

  @BelongsTo(() => Event, { foreignKey: 'event_id', targetKey: 'id' })
  event: Event;

  @BelongsTo(() => MeetingLinks, { onDelete: 'SET NULL' })
  meetingLink: MeetingLinks;

  @HasMany(() => Guest, { sourceKey: 'id', as: 'attendees' })
  attendees: Guest[];
}
