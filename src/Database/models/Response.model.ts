import { Table, Column, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Base } from '../base';
import Question from './Question.model';
import Guest from './Guest.model';

export interface IResponseT {
  responder: number;
  question_id: number;
  answer: string;
}

@Table({
  tableName: 'responses',
  paranoid: true,
  timestamps: true,
})
export default class ResponseT extends Base<IResponseT> implements IResponseT {
  @ForeignKey(() => Guest)
  @Column
  responder: number;

  @ForeignKey(() => Question)
  @Column
  question_id: number;

  @Column
  answer: string;

  @BelongsTo(() => Guest, { foreignKey: 'responder', targetKey: 'id', as: 'answers' })
  attendee: Guest;

  @BelongsTo(() => Question, { foreignKey: 'question_id', targetKey: 'id' })
  question: Question;
}
