import { Table, Column, PrimaryKey, Model, AutoIncrement, HasMany } from 'sequelize-typescript';
import Recursion from './Recursion.model';
import BookMe from './BookMe.model';

export interface ICalendarModel {
  id?: number;
  calendarId?: string;
  summary?: string;
}

@Table({
  tableName: 'calendars',
  paranoid: true,
  timestamps: true,
})
export default class CalendarModel extends Model<CalendarModel> implements ICalendarModel {
  @PrimaryKey
  @AutoIncrement
  @Column
  id?: number;

  @Column
  calendarId: string;

  @Column
  summary: string;

  @HasMany(() => BookMe)
  bookme: BookMe[];

  @HasMany(() => Recursion, { onDelete: 'CASCADE' })
  recursions: Recursion[];
}
