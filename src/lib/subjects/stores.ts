// 教科ごとのデータ保存場所(Redisのキー名)。サーバー側のAPIだけが使う
// キー名を変えると本番の既存データが読めなくなるので、変更しないこと
import {
  clearsKey,
  statsKey,
  GRADUATES_KEY,
  STREAK_BEST_KEY,
  math1ClearsKey,
  math1StatsKey,
  MATH1_GRADUATES_KEY,
  MATH1_STREAK_BEST_KEY,
  scienceClearsKey,
  scienceStatsKey,
  SCIENCE_GRADUATES_KEY,
  SCIENCE_STREAK_BEST_KEY,
} from "@/lib/redis";
import { CATEGORIES as MATH_CATEGORIES } from "@/lib/questionBank";
import { CATEGORIES as MATH1_CATEGORIES } from "@/lib/math1QuestionBank";
import { CATEGORIES as SCIENCE_CATEGORIES } from "@/lib/scienceQuestionBank";

export interface SubjectStore {
  // 回数制限のキーにつける目印(教科ごとに別カウントにするため)
  rateLimitName: { progress: string; stats: string };
  categories: readonly string[];
  clearsKey: (username: string) => string;
  statsKey: (username: string) => string;
  graduatesKey: string;
  streakBestKey: string;
}

export const mathStore: SubjectStore = {
  rateLimitName: { progress: "progress", stats: "stats" },
  categories: MATH_CATEGORIES,
  clearsKey,
  statsKey,
  graduatesKey: GRADUATES_KEY,
  streakBestKey: STREAK_BEST_KEY,
};

export const math1Store: SubjectStore = {
  rateLimitName: { progress: "math1-progress", stats: "math1-stats" },
  categories: MATH1_CATEGORIES,
  clearsKey: math1ClearsKey,
  statsKey: math1StatsKey,
  graduatesKey: MATH1_GRADUATES_KEY,
  streakBestKey: MATH1_STREAK_BEST_KEY,
};

export const scienceStore: SubjectStore = {
  rateLimitName: { progress: "science-progress", stats: "science-stats" },
  categories: SCIENCE_CATEGORIES,
  clearsKey: scienceClearsKey,
  statsKey: scienceStatsKey,
  graduatesKey: SCIENCE_GRADUATES_KEY,
  streakBestKey: SCIENCE_STREAK_BEST_KEY,
};
