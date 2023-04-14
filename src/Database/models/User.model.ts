import { Table, PrimaryKey, AutoIncrement, Column, Unique, HasMany, HasOne } from 'sequelize-typescript';
import { Base } from '../base';
import Event from './Event.model';
import Recursion from './Recursion.model';
import Zoom from './Zoom.model';
import Manage from './Manage.model';
import BookMe from './BookMe.model';

export enum UserType {
  USER = 'user',
  GUEST = 'guest',
}

export interface IUser {
  id?: number;
  name?: string;
  provider?: string;
  photoUrl?: string;
  email: string;
  type?: UserType;
  gRefreshToken?: string;
}

@Table({
  tableName: 'users',
  paranoid: true,
  timestamps: true,
})
export default class User extends Base<User> implements IUser {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Unique
  @Column
  email: string;

  @Column
  name: string;

  @Column
  provider: string;

  @Column
  photoUrl: string;

  @Column
  type: UserType;

  @Column
  gRefreshToken: string;

  @HasMany(() => Recursion)
  recursions: Recursion[];

  @HasOne(() => Zoom)
  zoom: Zoom;

  @HasMany(() => Manage, { sourceKey: 'id', as: 'manager' })
  manager: Manage;

  @HasMany(() => Manage, { sourceKey: 'id', as: 'managee' })
  managee: Manage;

  @HasMany(() => Recursion, { sourceKey: 'id', as: 'managed' })
  recursion: Recursion[];

  @HasOne(() => Event)
  host: Event[];

  @HasMany(() => BookMe)
  bookmes: BookMe[];
}
