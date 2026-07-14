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

// 理科クイズ用
export function scienceClearsKey(username: string) {
  return `science-quiz:clears:${username}`;
}

export const SCIENCE_GRADUATES_KEY = "science-quiz:graduates";
export const SCIENCE_STREAK_BEST_KEY = "science-quiz:streak-best";

// 中学1年 数学クイズ用
export function math1ClearsKey(username: string) {
  return `math1-quiz:clears:${username}`;
}

export const MATH1_GRADUATES_KEY = "math1-quiz:graduates";
export const MATH1_STREAK_BEST_KEY = "math1-quiz:streak-best";

export function parseZRangeWithScores(flat: string[]): { member: string; score: number }[] {
  const result: { member: string; score: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    result.push({ member: flat[i], score: Number(flat[i + 1]) });
  }
  return result;
}
