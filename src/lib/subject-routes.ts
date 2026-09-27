// 教科クイズ共通のAPI処理。各教科の route.ts はここに保存場所(SubjectStore)を渡すだけ
import { NextRequest, NextResponse } from "next/server";
import type { QuizResultEntry, StatsData } from "@/lib/stats";
import type { SubjectStore } from "@/lib/subjects/stores";
import { redis } from "@/lib/redis";
import { authenticate, credentialsFromHeaders } from "@/lib/auth-check";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

async function rateLimited(request: NextRequest, name: string) {
  const allowed = await checkRateLimit(`ratelimit:${name}:${clientIp(request)}`, 30, 60);
  if (allowed) return null;
  return NextResponse.json(
    { error: "試行回数が多すぎます。しばらくしてからお試しください" },
    { status: 429 }
  );
}

// ログイン確認。成功ならユーザー名、失敗ならエラーレスポンスを返す
// (GET はヘッダー、POST はボディから認証情報を受け取る)
async function checkAuth(username?: string, password?: string) {
  if (!username || !password) {
    return {
      error: NextResponse.json({ error: "ユーザー名とパスワードが必要です" }, { status: 400 }),
    };
  }
  if (!(await authenticate(username, password))) {
    return { error: NextResponse.json({ error: "認証に失敗しました" }, { status: 401 }) };
  }
  return { username };
}

function checkAuthFromHeaders(request: NextRequest) {
  const credentials = credentialsFromHeaders(request);
  return checkAuth(credentials?.username, credentials?.password);
}

// ---------- 進捗(カテゴリクリア・卒業・連続正解の自己ベスト) ----------

export function createProgressRoute(store: SubjectStore) {
  async function readProgress(username: string) {
    const [clears, graduatedAtScore, bestStreakScore] = await Promise.all([
      redis.smembers(store.clearsKey(username)),
      redis.zscore(store.graduatesKey, username),
      redis.zscore(store.streakBestKey, username),
    ]);
    return {
      clears,
      graduatedAt: graduatedAtScore ? new Date(graduatedAtScore).toISOString() : null,
      bestStreak: bestStreakScore ?? 0,
    };
  }

  async function GET(request: NextRequest) {
    const limited = await rateLimited(request, store.rateLimitName.progress);
    if (limited) return limited;

    const auth = await checkAuthFromHeaders(request);
    if (auth.error) return auth.error;

    return NextResponse.json(await readProgress(auth.username));
  }

  async function POST(request: NextRequest) {
    const limited = await rateLimited(request, store.rateLimitName.progress);
    if (limited) return limited;

    const { username, password, categoryClear, graduate, streak } = (await request.json()) as {
      username?: string;
      password?: string;
      categoryClear?: string;
      graduate?: boolean;
      streak?: number;
    };
    const auth = await checkAuth(username, password);
    if (auth.error) return auth.error;

    if (categoryClear && store.categories.includes(categoryClear)) {
      await redis.sadd(store.clearsKey(auth.username), categoryClear);
    }

    if (graduate) {
      await redis.zadd(store.graduatesKey, { nx: true }, { score: Date.now(), member: auth.username });
    }

    let newBest = false;
    if (typeof streak === "number" && Number.isFinite(streak) && streak > 0) {
      const changed = await redis.zadd(
        store.streakBestKey,
        { gt: true, ch: true },
        { score: streak, member: auth.username }
      );
      newBest = (changed ?? 0) > 0;
    }

    return NextResponse.json({ ...(await readProgress(auth.username)), newBest });
  }

  return { GET, POST };
}

// ---------- 成績(カテゴリごとの回答数・正解数) ----------

function parseStats(raw: Record<string, number> | null): StatsData {
  const stats: StatsData = {};
  if (!raw) return stats;
  for (const [field, value] of Object.entries(raw)) {
    const separatorIndex = field.lastIndexOf(":");
    const category = field.slice(0, separatorIndex);
    const kind = field.slice(separatorIndex + 1);
    if (kind !== "attempts" && kind !== "correct") continue;
    if (!stats[category]) stats[category] = { attempts: 0, correct: 0 };
    stats[category][kind] = Number(value);
  }
  return stats;
}

export function createStatsRoute(store: SubjectStore) {
  async function GET(request: NextRequest) {
    const limited = await rateLimited(request, store.rateLimitName.stats);
    if (limited) return limited;

    const auth = await checkAuthFromHeaders(request);
    if (auth.error) return auth.error;

    const raw = await redis.hgetall<Record<string, number>>(store.statsKey(auth.username));
    return NextResponse.json(parseStats(raw));
  }

  async function POST(request: NextRequest) {
    const limited = await rateLimited(request, store.rateLimitName.stats);
    if (limited) return limited;

    const { username, password, results = [] } = (await request.json()) as {
      username?: string;
      password?: string;
      results?: QuizResultEntry[];
    };
    const auth = await checkAuth(username, password);
    if (auth.error) return auth.error;

    const key = store.statsKey(auth.username);
    if (results.length > 0) {
      const pipeline = redis.pipeline();
      for (const { category, correct } of results) {
        pipeline.hincrby(key, `${category}:attempts`, 1);
        if (correct) pipeline.hincrby(key, `${category}:correct`, 1);
      }
      await pipeline.exec();
    }

    const raw = await redis.hgetall<Record<string, number>>(key);
    return NextResponse.json(parseStats(raw));
  }

  return { GET, POST };
}
