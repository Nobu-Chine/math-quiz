import type { Question } from "@/lib/questionBank";

export interface AnswerRecord {
  question: Question;
  userAnswer: string;
  correct: boolean;
}

export type Screen = "top" | "loading" | "quiz" | "result" | "weakness";

export type QuizMode = "normal" | "camp";
