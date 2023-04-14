import { Table, Column, PrimaryKey, Model, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Colors from './Colors.model';
import User from './User.model';
import Guest from './Guest.model';
import MeetingLinks from './MeetingLinks.model';
import CalendarModel from './Calendar.model';

export interface IBookMe {
  id: string;
  title: string;
  user_id: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  colorId: number;
  calendarId: number;
  location: string;
  linkId?: number;
  slotSize?: number;
}

@Table({
  tableName: 'bookmes',
  paranoid: true,
  timestamps: true,
})
export default class BookMe extends Model<IBookMe> {
  @PrimaryKey
  @Column
  id: string;

  @Column
  title: string;

  @ForeignKey(() => User)
  @Column
  user_id: number;

  @Column
  startDate: string;

  @Column
  endDate: string;

  @Column
  startTime: string;

  @Column
  endTime: string;

  @ForeignKey(() => Colors)
  @Column
  colorId: number;

  @ForeignKey(() => CalendarModel)
  @Column
  calendarId: number;

  @Column
  location: string;

  @Column
  slotSize: number;

  @ForeignKey(() => MeetingLinks)
  @Column
  linkId?: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Colors)
  color: Colors;

  @HasMany(() => Guest)
  guests: Guest[];

  @BelongsTo(() => MeetingLinks, { onDelete: 'SET NULL' })
  links: MeetingLinks;

  @BelongsTo(() => CalendarModel)
  calendar: CalendarModel;
}
