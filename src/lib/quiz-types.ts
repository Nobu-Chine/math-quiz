import type { Question } from "@/lib/questionBank";

export interface AnswerRecord {
  question: Question;
  userAnswer: string;
  correct: boolean;
}

export type Screen =
  | "top"
  | "loading"
  | "quiz"
  | "result"
  | "weakness"
  | "category-select"
  | "streak"
  | "streak-result";

export type QuizMode = "normal" | "camp" | "category" | "graduation" | "streak";
