import { NextRequest, NextResponse } from "next/server";
import { redis, mapPerfectCountKey, MAP_GRADUATES_KEY } from "@/lib/redis";
import { authenticate, credentialsFromHeaders } from "@/lib/auth-check";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const GRADUATION_THRESHOLD = 3;

async function readStatus(username: string) {
  const [perfectCount, graduatedAtScore] = await Promise.all([
    redis.get<number>(mapPerfectCountKey(username)),
    redis.zscore(MAP_GRADUATES_KEY, username),
  ]);
  return {
    perfectCount: perfectCount ?? 0,
    graduated: graduatedAtScore !== null,
    graduatedAt: graduatedAtScore ? new Date(graduatedAtScore).toISOString() : null,
  };
}

export async function GET(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:map-progress:${clientIp(request)}`, 30, 60);
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

  return NextResponse.json(await readStatus(username));
}

export async function POST(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:map-progress:${clientIp(request)}`, 30, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  const body = (await request.json()) as {
    username?: string;
    password?: string;
    missCount?: number;
  };
  const { username, password, missCount } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "ユーザー名とパスワードが必要です" }, { status: 400 });
  }
  if (!(await authenticate(username, password))) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  if (missCount === 0) {
    const newCount = await redis.incr(mapPerfectCountKey(username));
    if (newCount >= GRADUATION_THRESHOLD) {
      // 3回目に到達した瞬間のみ記録される(nxで既存の卒業日時は上書きしない)
      await redis.zadd(MAP_GRADUATES_KEY, { nx: true }, { score: Date.now(), member: username });
    }
  }

  return NextResponse.json(await readStatus(username));
}
