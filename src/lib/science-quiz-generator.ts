import { CATEGORIES, SCIENCE_QUESTIONS } from "@/lib/scienceQuestionBank";
import type { Question } from "@/lib/questionBank";
import type { StatsData } from "@/lib/stats";

export { CATEGORIES };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function poolFor(category: string): Question[] {
  return SCIENCE_QUESTIONS.filter((q) => q.category === category);
}

// 1問だけランダムに出す(連続回答モード用)
export function generateQuestion(): Question {
  return SCIENCE_QUESTIONS[Math.floor(Math.random() * SCIENCE_QUESTIONS.length)];
}

// 複数のカテゴリからできるだけ均等に、重複しないよう問題を集める
function sampleAcrossCategories(count: number, categories: string[]): Question[] {
  const result: Question[] = [];
  const usedByCategory: Record<string, Question[]> = {};
  const order = shuffle(categories);
  let round = 0;

  while (result.length < count) {
    let addedThisRound = false;
    for (const category of order) {
      if (result.length >= count) break;
      if (!usedByCategory[category]) {
        usedByCategory[category] = shuffle(poolFor(category));
      }
      const pool = usedByCategory[category];
      if (round < pool.length) {
        result.push(pool[round]);
        addedThisRound = true;
      }
    }
    round++;
    if (!addedThisRound) break; // 全カテゴリの問題を使い切った
  }

  return shuffle(result);
}

// ふつうモード: 全単元からなるべく重複しないよう出題する
export function generateNormalQuiz(count: number): Question[] {
  return sampleAcrossCategories(count, CATEGORIES as unknown as string[]);
}

// 正答率が低い(=苦手な)カテゴリを優先し、未挑戦のカテゴリで枠を埋める
export function pickWeakCategories(stats: StatsData, limit: number): string[] {
  const categories = CATEGORIES as unknown as string[];
  const tried = categories
    .filter((c) => (stats[c]?.attempts ?? 0) > 0)
    .sort((a, b) => stats[a].correct / stats[a].attempts - stats[b].correct / stats[b].attempts);
  const untried = shuffle(categories.filter((c) => (stats[c]?.attempts ?? 0) === 0));
  return [...tried, ...untried].slice(0, limit);
}

const CAMP_CATEGORY_COUNT = 4;

// 合宿モード: 苦手単元に絞って集中的に出題する
export function generateCampQuiz(count: number, stats: StatsData): Question[] {
  const weakCategories = pickWeakCategories(
    stats,
    Math.min(CAMP_CATEGORY_COUNT, CATEGORIES.length)
  );
  return sampleAcrossCategories(count, weakCategories);
}

// カテゴリテストモード: 指定した1単元の問題をすべて(シャッフルして)出題する
export function generateCategoryQuiz(category: string, count = 6): Question[] {
  return shuffle(poolFor(category)).slice(0, count);
}

// 総合テスト: 全単元からできるだけ均等に(基本1問ずつ)出題する
export function generateGraduationQuiz(count = CATEGORIES.length): Question[] {
  const categories = CATEGORIES as unknown as string[];
  const base = Math.floor(count / categories.length);
  const remainder = count % categories.length;
  const bonusCategories = new Set(shuffle(categories).slice(0, remainder));

  const result: Question[] = [];
  for (const category of categories) {
    const quota = base + (bonusCategories.has(category) ? 1 : 0);
    if (quota > 0) {
      result.push(...shuffle(poolFor(category)).slice(0, quota));
    }
  }
  return shuffle(result);
}
