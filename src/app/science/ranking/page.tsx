import Link from "next/link";
import { redis, SCIENCE_STREAK_BEST_KEY, parseZRangeWithScores } from "@/lib/redis";

export const revalidate = 30;

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function ScienceRankingPage() {
  const flat = await redis.zrange<string[]>(SCIENCE_STREAK_BEST_KEY, 0, 4, {
    rev: true,
    withScores: true,
  });
  const ranking = parseZRangeWithScores(flat).map(({ member, score }) => ({
    username: member,
    bestStreak: score,
  }));

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-emerald-100 via-teal-100 to-sky-100 px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md flex-1 flex-col gap-6">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-emerald-600">中学1年 理科</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-700">🔥 連続正解ランキング</h1>
          <p className="mt-3 text-slate-500">自己ベストのトップ5</p>
        </div>

        {ranking.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-md">
            まだ記録がありません
          </div>
        )}

        {ranking.length > 0 && (
          <div className="flex flex-col gap-3">
            {ranking.map((r, i) => (
              <div
                key={r.username}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-lg">{MEDALS[i] ?? `${i + 1}`}</span>
                  <span className="font-semibold text-slate-700">{r.username}</span>
                </div>
                <span className="text-sm font-bold text-orange-500">{r.bestStreak}問連続</span>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/science"
          className="mt-auto w-full rounded-2xl bg-white py-4 text-center text-lg font-semibold text-emerald-600 shadow-md transition-transform active:scale-95"
        >
          理科クイズにもどる
        </Link>
      </div>
    </div>
  );
}
