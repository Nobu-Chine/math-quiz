import type { Question } from "@/lib/questionBank";

export function isCorrectAnswer(question: Question, rawInput: string): boolean {
  if (question.type === "choice") {
    return rawInput === question.answer;
  }
  const num = Number(rawInput);
  if (Number.isNaN(num)) return false;
  const target = Number(question.answer);
  const tolerance = question.tolerance ?? 0;
  return Math.abs(num - target) <= tolerance + 1e-9;
}
