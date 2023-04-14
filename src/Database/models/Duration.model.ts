import { Table, PrimaryKey, AutoIncrement, Column, HasMany } from 'sequelize-typescript';
import { Base } from '../base';
import Meeting from './Meeting.model';

export interface IDuration {
  id?: number;
  from: Date;
  to: Date;
}

@Table({
  tableName: 'durations',
  paranoid: true,
  timestamps: true,
})
export default class Duration extends Base<Duration> implements IDuration {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  from: Date;

  @Column
  to: Date;

  @HasMany(() => Meeting)
  meetings: Meeting[];
}
