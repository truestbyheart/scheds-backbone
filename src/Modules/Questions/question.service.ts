import { BaseService } from '../Shared/base.service';
import Question, { IQuestion } from '../../Database/models/Question.model';
import database from '../../Database';
import User from '../../Database/models/User.model';
import { QuestionModel } from '../Shared/Model/question.model';

export default class QuestionService extends BaseService<Question, number> {
  constructor(question = database.getRepository(Question)) {
    super(question);
  }

  private defaultInclude = [
    {
      model: User,
    },
  ];

  async createQuestion(question: IQuestion): Promise<IQuestion> {
    const createdQuestion = await this.model.create<Question>(question);
    return createdQuestion.get() as Question;
  }

  async findQuestionById(id: number) {
    return await this.findById(id, this.defaultInclude);
  }

  async deleteQuestions(id: number) {
    return this.model.destroy({ where: { id }, force: true });
  }

  async upsert(values: any, condition: any) {
    return this.model.findOne(condition).then((mt) => {
      if (mt) return mt.update(values);
      return this.model.create(values);
    });
  }

  deleteRecursionQn(recursionId: string) {
    return this.model.destroy({ where: { recursionId }, force: true });
  }

  updateQuestion(question: QuestionModel) {
    return this.model.update(question, { where: { id: question.id as number } });
  }
}

export const questionService = new QuestionService();
