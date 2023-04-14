import { AllowNull, AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import BookMe from './BookMe.model';
import Recursion from './Recursion.model';

export interface IColors {
  id?: number;
  background: string;
  foreground: string;
}

@Table({
  tableName: 'colors',
  paranoid: true,
  timestamps: true,
})
export default class Colors extends Model<IColors> {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  id: number;

  @AllowNull(false)
  @Column
  background: string;

  @AllowNull(false)
  @Column
  foreground: string;

  @HasMany(() => Recursion)
  event: Recursion[];

  @HasMany(() => BookMe)
  bookmes: BookMe[];
}
