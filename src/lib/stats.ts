export interface CategoryStat {
  attempts: number;
  correct: number;
}

export type StatsData = Record<string, CategoryStat>;

export interface QuizResultEntry {
  category: string;
  correct: boolean;
}
