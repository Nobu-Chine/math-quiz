import {
  CATEGORIES,
  generateQuestion,
  generateNormalQuiz,
  generateCampQuiz,
  generateCategoryQuiz,
  generateGraduationQuiz,
} from "@/lib/science-quiz-generator";
import type { SubjectConfig } from "./types";

// 中学1年 理科
export const scienceSubject: SubjectConfig = {
  gradeLabel: "中学1年",
  title: "理科クイズ",
  description:
    "単元ごとに練習して力をつけ\n合宿モードで苦手を克服\n全単元を制覇して、総合テストに挑戦しよう！",
  graduatesHref: "/science/graduates",
  rankingHref: "/science/ranking",

  backgroundClass: "from-emerald-100 via-teal-100 to-sky-100",
  loadingEmoji: "🔬",

  progressApiPath: "/api/science/progress",
  statsApiPath: "/api/science/stats",

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
