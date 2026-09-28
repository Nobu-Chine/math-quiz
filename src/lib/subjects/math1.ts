import {
  CATEGORIES,
  generateQuestion,
  generateNormalQuiz,
  generateCampQuiz,
  generateCategoryQuiz,
  generateGraduationQuiz,
} from "@/lib/math1-quiz-generator";
import { math1Theme } from "@/lib/themes";
import type { SubjectConfig } from "./types";

// 中学1年 数学
export const math1Subject: SubjectConfig = {
  gradeLabel: "中学1年",
  title: "数学クイズ",
  description:
    "単元ごとに練習して力をつけ\n合宿モードで苦手を克服\n全単元を制覇して、総合テストに挑戦しよう！",
  graduatesHref: "/math1/graduates",
  rankingHref: "/math1/ranking",

  backgroundClass: math1Theme.backgroundClass,
  loadingEmoji: "📐",

  progressApiPath: "/api/math1/progress",
  statsApiPath: "/api/math1/stats",

  categories: CATEGORIES,
  questionCount: 10,
  categoryQuestionCount: 6,
  graduationQuestionCount: CATEGORIES.length, // 18
  generator: {
    generateQuestion,
    generateNormalQuiz,
    generateCampQuiz,
    generateCategoryQuiz,
    generateGraduationQuiz,
  },
};
