import { NextRequest, NextResponse } from "next/server";
import { redis, SCIENCE_GRADUATES_KEY, parseZRangeWithScores } from "@/lib/redis";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:science-graduates:${clientIp(request)}`, 30, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  const flat = await redis.zrange<string[]>(SCIENCE_GRADUATES_KEY, 0, -1, {
    rev: true,
    withScores: true,
  });
  const graduates = parseZRangeWithScores(flat).map(({ member, score }) => ({
    username: member,
    graduatedAt: new Date(score).toISOString(),
  }));

  return NextResponse.json({ graduates });
}
