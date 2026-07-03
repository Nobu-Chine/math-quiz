export type QuestionType = "numeric" | "choice";

export interface Question {
  text: string;
  type: QuestionType;
  answer: number | string;
  choices?: string[];
  explain: string;
  category: string;
  tolerance?: number;
}

export const CATEGORIES: string[];
export function generateQuestion(): Question;
export function generateQuiz(count?: number): Question[];
