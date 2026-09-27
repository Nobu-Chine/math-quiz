import type { Question } from "@/lib/questionBank";
import type { StatsData } from "@/lib/stats";

// 教科ごとに違う部分をまとめた設定。QuizApp はこれを受け取って動く
export interface SubjectConfig {
  // トップ画面の表示
  gradeLabel: string;
  title: string;
  description: string;
  graduatesHref: string;
  rankingHref: string;

  // 見た目
  backgroundClass: string;
  loadingEmoji: string;

  // 進捗・成績を保存するAPI
  progressApiPath: string;
  statsApiPath: string;

  // 問題
  categories: readonly string[];
  questionCount: number;
  categoryQuestionCount: number;
  graduationQuestionCount: number;
  generator: {
    generateQuestion: () => Question;
    generateNormalQuiz: (count: number) => Question[];
    generateCampQuiz: (count: number, stats: StatsData) => Question[];
    generateCategoryQuiz: (category: string, count: number) => Question[];
    generateGraduationQuiz: (count: number) => Question[];
  };
}
