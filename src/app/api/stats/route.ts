import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { QuizResultEntry, StatsData } from "@/lib/stats";
import { verifyPassword } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const redis = Redis.fromEnv();
const USERS_KEY = "math-quiz:users";

function statsKey(username: string) {
  return `math-quiz:stats:${username}`;
}

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

async function authenticate(username: string, password: string) {
  const hash = await redis.hget<string>(USERS_KEY, username);
  if (!hash) return false;
  return verifyPassword(password, hash);
}

function credentialsFromHeaders(request: NextRequest): { username: string; password: string } | null {
  const username = request.headers.get("x-username");
  const password = request.headers.get("x-password");
  if (!username || !password) return null;
  try {
    return { username: decodeURIComponent(username), password: decodeURIComponent(password) };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:stats:${clientIp(request)}`, 30, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  const body = (await request.json()) as {
    username?: string;
    password?: string;
    results?: QuizResultEntry[];
  };
  const { username, password, results = [] } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "ユーザー名とパスワードが必要です" }, { status: 400 });
  }
  if (!(await authenticate(username, password))) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  const key = statsKey(username);
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

export async function GET(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:stats:${clientIp(request)}`, 30, 60);
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

  const raw = await redis.hgetall<Record<string, number>>(statsKey(username));
  return NextResponse.json(parseStats(raw));
}
