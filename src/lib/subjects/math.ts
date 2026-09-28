import { CATEGORIES, generateQuestion } from "@/lib/questionBank";
import {
  generateNormalQuiz,
  generateCampQuiz,
  generateCategoryQuiz,
  generateGraduationQuiz,
} from "@/lib/quiz-generator";
import { mathTheme } from "@/lib/themes";
import type { SubjectConfig } from "./types";

// 6年生 算数
export const mathSubject: SubjectConfig = {
  gradeLabel: "6年生",
  title: "算数クイズ",
  description:
    "練習問題をこなして力をつけ\n合宿モードで苦手を克服\nカテゴリ制覇し、卒業テストに挑戦しよう！",
  graduatesHref: "/graduates",
  rankingHref: "/ranking",

  backgroundClass: mathTheme.backgroundClass,
  loadingEmoji: "🏕️",

  progressApiPath: "/api/progress",
  statsApiPath: "/api/stats",

  categories: CATEGORIES,
  questionCount: 5,
  categoryQuestionCount: 10,
  graduationQuestionCount: 28,
  generator: {
    generateQuestion,
    generateNormalQuiz,
    generateCampQuiz,
    generateCategoryQuiz,
    generateGraduationQuiz,
  },
};
