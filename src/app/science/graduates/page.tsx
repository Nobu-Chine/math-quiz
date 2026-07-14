import Link from "next/link";
import { redis, SCIENCE_GRADUATES_KEY, parseZRangeWithScores } from "@/lib/redis";

export const revalidate = 30;

export default async function ScienceGraduatesPage() {
  const flat = await redis.zrange<string[]>(SCIENCE_GRADUATES_KEY, 0, -1, {
    rev: true,
    withScores: true,
  });
  const graduates = parseZRangeWithScores(flat).map(({ member, score }) => ({
    username: member,
    graduatedAt: new Date(score),
  }));

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-emerald-100 via-teal-100 to-sky-100 px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md flex-1 flex-col gap-6">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide text-emerald-600">中学1年 理科</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-700">🎓 卒業生リスト</h1>
          <p className="mt-3 text-slate-500">全単元クリア + 総合テスト合格者</p>
        </div>

        {graduates.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-md">
            まだ卒業した人がいません
          </div>
        )}

        {graduates.length > 0 && (
          <div className="flex flex-col gap-3">
            {graduates.map((g, i) => (
              <div
                key={g.username}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-emerald-500">{i + 1}</span>
                  <span className="font-semibold text-slate-700">{g.username}</span>
                </div>
                <span className="text-sm text-slate-500">
                  {g.graduatedAt.toLocaleDateString("ja-JP")}
                </span>
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
