import { BelongsTo, Column, Default, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import Event from './Event.model';
import User from './User.model';
import Question from './Question.model';
import Workspace from './workspace.model';
import Colors from './Colors.model';
import MeetingLinks from './MeetingLinks.model';
import CalendarModel from './Calendar.model';
import Guest from './Guest.model';
import Manage from './Manage.model';

export enum Location {
  Meet = 'meet',
  Zoom = 'zoom',
}
export interface IRecursion {
  id?: string;
  title: string;
  description: string;
  workspaceId?: string;
  creator: number;
  colorId: number;
  linkId?: number;
  manageeId?: number | null | undefined;
  calendarId?: number | null | undefined;
  location: Location;
}
@Table({
  tableName: 'recursions',
  paranoid: true,
  timestamps: true,
})
export default class Recursion extends Model<IRecursion> {
  @PrimaryKey
  @Column
  id: string;

  @Column
  title: string;

  @Column
  description: string;

  @ForeignKey(() => User)
  @Column
  creator: number;

  @ForeignKey(() => Colors)
  @Column
  colorId: number;

  @ForeignKey(() => Workspace)
  @Column
  workspaceId: string;

  @ForeignKey(() => MeetingLinks)
  @Column
  linkId: number;

  @ForeignKey(() => Manage)
  @Column
  manageeId: number;

  @ForeignKey(() => CalendarModel)
  @Column
  calendarId: number;

  @Default(Location.Meet)
  @Column
  location: Location;

  @BelongsTo(() => User, { foreignKey: 'creator', targetKey: 'id', as: 'manager' })
  user: User;

  @BelongsTo(() => Workspace)
  workspace: Workspace;

  @BelongsTo(() => Colors)
  color: Colors;

  @BelongsTo(() => MeetingLinks, { onDelete: 'SET NULL' })
  link: MeetingLinks;

  @BelongsTo(() => Manage, { foreignKey: 'manageeId', targetKey: 'id', as: 'managee' })
  managee: User;

  @BelongsTo(() => CalendarModel)
  calendar: CalendarModel;

  @HasMany(() => Event, { sourceKey: 'id', onDelete: 'CASCADE' })
  events: Event[];

  @HasMany(() => Question, { onDelete: 'CASCADE' })
  questions: Question[];

  @HasMany(() => Guest, { sourceKey: 'id', onDelete: 'CASCADE' })
  guests: Guest[];
}
