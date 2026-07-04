import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import type { QuizResultEntry, StatsData } from "@/lib/stats";

const redis = Redis.fromEnv();
const STATS_KEY = "math-quiz:stats";

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

export async function GET() {
  const raw = await redis.hgetall<Record<string, number>>(STATS_KEY);
  return NextResponse.json(parseStats(raw));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { results?: QuizResultEntry[] };
  const results = body.results ?? [];

  if (results.length > 0) {
    const pipeline = redis.pipeline();
    for (const { category, correct } of results) {
      pipeline.hincrby(STATS_KEY, `${category}:attempts`, 1);
      if (correct) pipeline.hincrby(STATS_KEY, `${category}:correct`, 1);
    }
    await pipeline.exec();
  }

  const raw = await redis.hgetall<Record<string, number>>(STATS_KEY);
  return NextResponse.json(parseStats(raw));
}
