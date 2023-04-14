import { Table, Model, PrimaryKey, AutoIncrement, Column, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Meeting from './Meeting.model';
import Recursion from './Recursion.model';
import ResponseT from './Response.model';
import BookMe from './BookMe.model';

export interface IGuest {
  id?: number;
  name?: string;
  email: string;
  meetingId?: number | null;
  recursionId?: string;
  calMeetId?: string | null | undefined;
  bookmeId?: string;
  startTime?: Date;
  endTime?: Date;
  reason?: string;
  invitedBy?: string;
}

@Table({
  tableName: 'guests',
  paranoid: true,
  timestamps: true,
})
export default class Guest extends Model<IGuest> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  email: string;

  @Column
  calMeetId?: string;

  @ForeignKey(() => BookMe)
  @Column
  bookmeId: string;

  @ForeignKey(() => Meeting)
  @Column
  meetingId?: number;

  @ForeignKey(() => Recursion)
  @Column
  recursionId?: string;

  @Column
  startTime: Date;

  @Column
  endTime: Date;

  @Column
  reason: string;

  @Column
  invitedBy: string;

  @BelongsTo(() => Meeting, { foreignKey: 'meetingId', targetKey: 'id' })
  meeting: Meeting;

  @BelongsTo(() => Recursion, { foreignKey: 'recursionId', targetKey: 'id' })
  recursion: Recursion;

  @BelongsTo(() => BookMe)
  bookme: BookMe;

  @HasMany(() => ResponseT, { sourceKey: 'id', as: 'answers', onDelete: 'CASCADE' })
  answers: ResponseT[];
}
