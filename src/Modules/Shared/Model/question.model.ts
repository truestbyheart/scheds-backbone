export interface QuestionModel {
  id?: number;
  inquiry: string;
}

export interface AnswerModel {
  id?: number;
  answer: string;
}

export interface QuestionComponentResponse {
  Remove: number[];
  add: QuestionModel[];
  update: QuestionModel[];
}
