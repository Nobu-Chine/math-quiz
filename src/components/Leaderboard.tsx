import Link from "next/link";
import type { Theme } from "@/lib/themes";

const MEDALS = ["🥇", "🥈", "🥉"];

interface LayoutProps {
  theme: Theme;
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  emptyMessage: string;
  isEmpty: boolean;
  children: React.ReactNode;
}

// ランキング・卒業生リスト共通の枠
function LeaderboardLayout({
  theme,
  title,
  subtitle,
  backHref,
  backLabel,
  emptyMessage,
  isEmpty,
  children,
}: LayoutProps) {
  return (
    <div
      className={`flex min-h-dvh w-full flex-col items-center bg-gradient-to-b ${theme.backgroundClass} px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]`}
    >
      <div className="flex w-full max-w-md flex-1 flex-col gap-6">
        <div className="text-center">
          <p className={`text-sm font-semibold tracking-wide ${theme.accentClass}`}>{theme.label}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-700">{title}</h1>
          <p className="mt-3 text-slate-500">{subtitle}</p>
        </div>

        {isEmpty ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-md">
            {emptyMessage}
          </div>
        ) : (
          <div className="flex flex-col gap-3">{children}</div>
        )}

        <Link
          href={backHref}
          className={`mt-auto w-full rounded-2xl bg-white py-4 text-center text-lg font-semibold ${theme.accentClass} shadow-md transition-transform active:scale-95`}
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">{left}</div>
      {right}
    </div>
  );
}

export function StreakRanking({
  theme,
  ranking,
  backHref,
  backLabel,
}: {
  theme: Theme;
  ranking: { username: string; bestStreak: number }[];
  backHref: string;
  backLabel: string;
}) {
  return (
    <LeaderboardLayout
      theme={theme}
      title="🔥 連続正解ランキング"
      subtitle="自己ベストのトップ5"
      backHref={backHref}
      backLabel={backLabel}
      emptyMessage="まだ記録がありません"
      isEmpty={ranking.length === 0}
    >
      {ranking.map((r, i) => (
        <Row
          key={r.username}
          left={
            <>
              <span className="w-8 text-center text-lg">{MEDALS[i] ?? `${i + 1}`}</span>
              <span className="font-semibold text-slate-700">{r.username}</span>
            </>
          }
          right={<span className="text-sm font-bold text-orange-500">{r.bestStreak}問連続</span>}
        />
      ))}
    </LeaderboardLayout>
  );
}

export function GraduatesList({
  theme,
  graduates,
  title = "🎓 卒業生リスト",
  subtitle,
  backHref,
  backLabel,
}: {
  theme: Theme;
  graduates: { username: string; graduatedAt: Date }[];
  title?: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <LeaderboardLayout
      theme={theme}
      title={title}
      subtitle={subtitle}
      backHref={backHref}
      backLabel={backLabel}
      emptyMessage="まだ卒業した人がいません"
      isEmpty={graduates.length === 0}
    >
      {graduates.map((g, i) => (
        <Row
          key={g.username}
          left={
            <>
              <span className={`text-lg font-bold ${theme.numberClass}`}>{i + 1}</span>
              <span className="font-semibold text-slate-700">{g.username}</span>
            </>
          }
          right={
            <span className="text-sm text-slate-500">
              {g.graduatedAt.toLocaleDateString("ja-JP")}
            </span>
          }
        />
      ))}
    </LeaderboardLayout>
  );
}
