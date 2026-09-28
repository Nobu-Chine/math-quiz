import { redis, parseZRangeWithScores } from "@/lib/redis";

// 連続正解の自己ベスト上位
export async function getStreakRanking(key: string, limit = 5) {
  const flat = await redis.zrange<string[]>(key, 0, limit - 1, { rev: true, withScores: true });
  return parseZRangeWithScores(flat).map(({ member, score }) => ({
    username: member,
    bestStreak: score,
  }));
}

// 卒業生(新しい順)
export async function getGraduates(key: string) {
  const flat = await redis.zrange<string[]>(key, 0, -1, { rev: true, withScores: true });
  return parseZRangeWithScores(flat).map(({ member, score }) => ({
    username: member,
    graduatedAt: new Date(score),
  }));
}
