interface StreakResultScreenProps {
  streak: number;
  bestStreak: number;
  newBest: boolean;
  onRestart: () => void;
  onBackToTop: () => void;
}

export default function StreakResultScreen({
  streak,
  bestStreak,
  newBest,
  onRestart,
  onBackToTop,
}: StreakResultScreenProps) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="rounded-3xl bg-white p-8 text-center shadow-md">
        <p className="inline-block rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-white">
          🔥 連続回答モード
        </p>
        <p className="mt-4 text-slate-500">れんぞく正解</p>
        <p className="mt-2 text-5xl font-extrabold text-slate-700">
          {streak} <span className="text-2xl font-semibold text-slate-400">問</span>
        </p>
        {newBest ? (
          <p className="mt-3 text-xl font-black text-fuchsia-500">🏆 自己ベスト更新!</p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">自己ベスト: {bestStreak}問</p>
        )}
      </div>

      <div className="flex flex-col gap-3 pb-4">
        <button
          onClick={onRestart}
          className="w-full rounded-2xl bg-violet-500 py-4 text-lg font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95"
        >
          もう一度
        </button>
        <button
          onClick={onBackToTop}
          className="w-full rounded-2xl bg-white py-4 text-lg font-semibold text-violet-500 shadow-md transition-transform active:scale-95"
        >
          トップへもどる
        </button>
      </div>
    </div>
  );
}
