import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export function clearsKey(username: string) {
  return `math-quiz:clears:${username}`;
}

export const GRADUATES_KEY = "math-quiz:graduates";
export const STREAK_BEST_KEY = "math-quiz:streak-best";

// マップクイズ用
export function mapPerfectCountKey(username: string) {
  return `map-quiz:perfect-count:${username}`;
}

export const MAP_GRADUATES_KEY = "map-quiz:graduates";

export function parseZRangeWithScores(flat: string[]): { member: string; score: number }[] {
  const result: { member: string; score: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    result.push({ member: flat[i], score: Number(flat[i + 1]) });
  }
  return result;
}
