import { NextRequest, NextResponse } from "next/server";
import {
  redis,
  scienceClearsKey,
  SCIENCE_GRADUATES_KEY,
  SCIENCE_STREAK_BEST_KEY,
} from "@/lib/redis";
import { CATEGORIES } from "@/lib/scienceQuestionBank";
import { authenticate, credentialsFromHeaders } from "@/lib/auth-check";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:science-progress:${clientIp(request)}`, 30, 60);
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
    redis.smembers(scienceClearsKey(username)),
    redis.zscore(SCIENCE_GRADUATES_KEY, username),
    redis.zscore(SCIENCE_STREAK_BEST_KEY, username),
  ]);

  return NextResponse.json({
    clears,
    graduatedAt: graduatedAtScore ? new Date(graduatedAtScore).toISOString() : null,
    bestStreak: bestStreakScore ?? 0,
  });
}

export async function POST(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:science-progress:${clientIp(request)}`, 30, 60);
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
    await redis.sadd(scienceClearsKey(username), categoryClear);
  }

  if (graduate) {
    await redis.zadd(SCIENCE_GRADUATES_KEY, { nx: true }, { score: Date.now(), member: username });
  }

  let newBest = false;
  if (typeof streak === "number" && Number.isFinite(streak) && streak > 0) {
    const changed = await redis.zadd(
      SCIENCE_STREAK_BEST_KEY,
      { gt: true, ch: true },
      { score: streak, member: username }
    );
    newBest = (changed ?? 0) > 0;
  }

  const [clears, graduatedAtScore, bestStreakScore] = await Promise.all([
    redis.smembers(scienceClearsKey(username)),
    redis.zscore(SCIENCE_GRADUATES_KEY, username),
    redis.zscore(SCIENCE_STREAK_BEST_KEY, username),
  ]);

  return NextResponse.json({
    clears,
    graduatedAt: graduatedAtScore ? new Date(graduatedAtScore).toISOString() : null,
    bestStreak: bestStreakScore ?? 0,
    newBest,
  });
}
