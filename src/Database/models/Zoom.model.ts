import { AutoIncrement, BelongsTo, Column, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import User from './User.model';

export interface IZoom {
  id?: number;
  userId: number;
  accessToken: string;
  refreshToken: string;
  zoomId?: string;
}

@Table({
  tableName: 'zooms',
  paranoid: true,
  timestamps: true,
})
export default class Zoom extends Model<IZoom> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  accessToken: string;

  @Column
  refreshToken: string;

  @Default('me')
  @Column
  zoomId: string;

  @BelongsTo(() => User)
  user: User;
}
