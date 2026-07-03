import { NextRequest, NextResponse } from "next/server";
import type { QuizResultEntry, StatsData } from "@/lib/stats";

// TODO(KV連携ステップ): Vercel KVに差し替える。今はプロセス内メモリのみで、
// サーバー再起動やインスタンスをまたぐと消える暫定実装。
const memoryStore: StatsData = {};

export async function GET() {
  return NextResponse.json(memoryStore);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { results?: QuizResultEntry[] };
  const results = body.results ?? [];

  for (const { category, correct } of results) {
    if (!memoryStore[category]) {
      memoryStore[category] = { attempts: 0, correct: 0 };
    }
    memoryStore[category].attempts += 1;
    if (correct) memoryStore[category].correct += 1;
  }

  return NextResponse.json(memoryStore);
}
