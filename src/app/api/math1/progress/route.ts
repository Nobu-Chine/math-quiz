import { NextRequest, NextResponse } from "next/server";
import {
  redis,
  math1ClearsKey,
  MATH1_GRADUATES_KEY,
  MATH1_STREAK_BEST_KEY,
} from "@/lib/redis";
import { CATEGORIES } from "@/lib/math1QuestionBank";
import { authenticate, credentialsFromHeaders } from "@/lib/auth-check";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:math1-progress:${clientIp(request)}`, 30, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  const credentials = credentialsFromHeaders(request);
  if (!credentials) {
    return NextResponse.json({ error: "ユーザー名とパスワードが必要です" }, { status: 400 });
  }
  const { username, password } = credentials;
  if (!(await authenticate(username, password))) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  const [clears, graduatedAtScore, bestStreakScore] = await Promise.all([
    redis.smembers(math1ClearsKey(username)),
    redis.zscore(MATH1_GRADUATES_KEY, username),
    redis.zscore(MATH1_STREAK_BEST_KEY, username),
  ]);

  return NextResponse.json({
    clears,
    graduatedAt: graduatedAtScore ? new Date(graduatedAtScore).toISOString() : null,
    bestStreak: bestStreakScore ?? 0,
  });
}

export async function POST(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:math1-progress:${clientIp(request)}`, 30, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  const body = (await request.json()) as {
    username?: string;
    password?: string;
    categoryClear?: string;
    graduate?: boolean;
    streak?: number;
  };
  const { username, password, categoryClear, graduate, streak } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "ユーザー名とパスワードが必要です" }, { status: 400 });
  }
  if (!(await authenticate(username, password))) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  if (categoryClear && (CATEGORIES as readonly string[]).includes(categoryClear)) {
    await redis.sadd(math1ClearsKey(username), categoryClear);
  }

  if (graduate) {
    await redis.zadd(MATH1_GRADUATES_KEY, { nx: true }, { score: Date.now(), member: username });
  }

  let newBest = false;
  if (typeof streak === "number" && Number.isFinite(streak) && streak > 0) {
    const changed = await redis.zadd(
      MATH1_STREAK_BEST_KEY,
      { gt: true, ch: true },
      { score: streak, member: username }
    );
    newBest = (changed ?? 0) > 0;
  }

  const [clears, graduatedAtScore, bestStreakScore] = await Promise.all([
    redis.smembers(math1ClearsKey(username)),
    redis.zscore(MATH1_GRADUATES_KEY, username),
    redis.zscore(MATH1_STREAK_BEST_KEY, username),
  ]);

  return NextResponse.json({
    clears,
    graduatedAt: graduatedAtScore ? new Date(graduatedAtScore).toISOString() : null,
    bestStreak: bestStreakScore ?? 0,
    newBest,
  });
}
