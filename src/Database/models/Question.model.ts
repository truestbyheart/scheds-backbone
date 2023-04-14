import { Table, Column, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Base } from '../base';
import ResponseT from './Response.model';
import Recursion from './Recursion.model';

export interface IQuestion {
  recursionId?: string;
  inquiry: string;
}

@Table({
  tableName: 'questions',
  paranoid: true,
  timestamps: true,
})
export default class Question extends Base<Question> implements IQuestion {
  @ForeignKey(() => Recursion)
  @Column
  recursionId: string;

  @Column
  inquiry: string;

  @BelongsTo(() => Recursion)
  recursion: Recursion;

  @HasMany(() => ResponseT, { sourceKey: 'id' })
  responses: ResponseT[];
}
