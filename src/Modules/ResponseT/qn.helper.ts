import { QuestionComponentResponse } from '../Shared/Model/question.model';
import { questionService } from '../Questions/question.service';

export const updateRecursionQn = async ({ add, Remove, update }: QuestionComponentResponse, recursionId: string) => {
  await Promise.all([
    add.map(async (qn) => {
      await questionService.createQuestion({ recursionId, inquiry: qn.inquiry });
    }),
    Remove.map(async (qn) => {
      await questionService.deleteQuestions(qn);
    }),
    update.map(async (qn) => {
      await questionService.updateQuestion(qn);
    }),
  ]);
};
