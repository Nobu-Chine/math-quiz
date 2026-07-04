import { CATEGORIES, generateQuestion } from "@/lib/questionBank";
import type { Question } from "@/lib/questionBank";
import type { StatsData } from "@/lib/stats";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sampleQuiz(
  count: number,
  maxPerCategory: number,
  accept: (category: string) => boolean
): Question[] {
  const result: Question[] = [];
  const categoryCounts: Record<string, number> = {};
  const maxAttempts = count * 200;
  let attempts = 0;

  while (result.length < count && attempts < maxAttempts) {
    attempts++;
    const q = generateQuestion();
    if (!accept(q.category)) continue;
    const used = categoryCounts[q.category] ?? 0;
    if (used >= maxPerCategory) continue;
    result.push(q);
    categoryCounts[q.category] = used + 1;
  }

  // 条件に合う問題を規定回数までに見つけられなかった場合の保険(理論上ほぼ発生しない)
  while (result.length < count) {
    result.push(generateQuestion());
  }

  return result;
}

// ふつうモード: 同じカテゴリがなるべく重複しないように10問を選ぶ
export function generateNormalQuiz(count: number): Question[] {
  const maxPerCategory = Math.max(1, Math.ceil(count / CATEGORIES.length));
  return sampleQuiz(count, maxPerCategory, () => true);
}

const CAMP_CATEGORY_COUNT = 4;

// 正答率が低い(=苦手な)カテゴリを優先し、未挑戦のカテゴリで枠を埋める
export function pickWeakCategories(stats: StatsData, limit: number): string[] {
  const tried = CATEGORIES.filter((c) => (stats[c]?.attempts ?? 0) > 0).sort(
    (a, b) => stats[a].correct / stats[a].attempts - stats[b].correct / stats[b].attempts
  );
  const untried = shuffle(CATEGORIES.filter((c) => (stats[c]?.attempts ?? 0) === 0));
  return [...tried, ...untried].slice(0, limit);
}

// 合宿モード: 苦手カテゴリに絞って集中的に出題する
export function generateCampQuiz(count: number, stats: StatsData): Question[] {
  const weakCategories = pickWeakCategories(stats, Math.min(CAMP_CATEGORY_COUNT, CATEGORIES.length));
  const weakSet = new Set(weakCategories);
  const maxPerCategory = Math.max(1, Math.ceil(count / weakSet.size));
  return sampleQuiz(count, maxPerCategory, (category) => weakSet.has(category));
}
