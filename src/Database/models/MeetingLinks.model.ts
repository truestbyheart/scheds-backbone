import { Table, Model, Column, PrimaryKey, AutoIncrement, HasMany, HasOne } from 'sequelize-typescript';
import Recursion from './Recursion.model';
import BookMe from './BookMe.model';
import Meeting from './Meeting.model';

export enum MeetingLinksTypes {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface IMeetingLinks {
  id?: number;
  link: string;
}

@Table({
  tableName: 'meetingLinks',
  paranoid: true,
  timestamps: true,
})
export default class MeetingLinks extends Model<IMeetingLinks> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  link: string;

  @HasMany(() => Recursion, { onDelete: 'SET NULL' })
  recursion: Recursion[];

  @HasMany(() => BookMe)
  bookmes: BookMe[];

  @HasOne(() => Meeting)
  meeting: Meeting;
}
