import { NextRequest, NextResponse } from "next/server";
import { redis, STREAK_BEST_KEY, parseZRangeWithScores } from "@/lib/redis";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:ranking:${clientIp(request)}`, 30, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  const flat = await redis.zrange<string[]>(STREAK_BEST_KEY, 0, 4, { rev: true, withScores: true });
  const ranking = parseZRangeWithScores(flat).map(({ member, score }) => ({
    username: member,
    bestStreak: score,
  }));

  return NextResponse.json({ ranking });
}
