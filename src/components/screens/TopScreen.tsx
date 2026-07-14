import Link from "next/link";

interface TopScreenProps {
  onStart: () => void;
  onStartCamp: () => void;
  onShowCategorySelect: () => void;
  onStartStreak: () => void;
  onShowWeakness: () => void;
  gradeLabel?: string;
  title?: string;
  description?: string;
  graduatesHref?: string;
  rankingHref?: string;
}

export default function TopScreen({
  onStart,
  onStartCamp,
  onShowCategorySelect,
  onStartStreak,
  onShowWeakness,
  gradeLabel = "6年生",
  title = "算数クイズ",
  description = "練習問題をこなして力をつけ\n合宿モードで苦手を克服\nカテゴリ制覇し、卒業テストに挑戦しよう！",
  graduatesHref = "/graduates",
  rankingHref = "/ranking",
}: TopScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
      <div>
        <p className="text-sm font-semibold tracking-wide text-violet-500">{gradeLabel}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-700">{title}</h1>
        <p className="mt-4 whitespace-pre-line text-base font-bold leading-relaxed text-slate-700">
          {description}
        </p>
      </div>
      <div className="flex w-full flex-col gap-4">
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-violet-500 py-5 text-xl font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95"
        >
          練習問題
        </button>
        <div>
          <button
            onClick={onStartCamp}
            className="w-full rounded-2xl bg-orange-400 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition-transform active:scale-95"
          >
            合宿モード
          </button>
          <p className="mt-1 text-xs text-slate-400">
            これまでの記録から、にがてなカテゴリを自動で選んで出題するよ
          </p>
        </div>
        <button
          onClick={onShowCategorySelect}
          className="w-full rounded-2xl bg-emerald-400 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-transform active:scale-95"
        >
          カテゴリ別に挑戦
        </button>
        <div>
          <button
            onClick={onStartStreak}
            className="w-full rounded-2xl bg-rose-400 py-4 text-lg font-bold text-white shadow-lg shadow-rose-200 transition-transform active:scale-95"
          >
            連続回答モード
          </button>
          <p className="mt-1 text-xs text-slate-400">
            1問でも間違えたら終了。何問連続で正解できるか挑戦しよう
          </p>
        </div>
        <button
          onClick={onShowWeakness}
          className="w-full rounded-2xl bg-white py-4 text-lg font-semibold text-violet-500 shadow-md transition-transform active:scale-95"
        >
          にがてぶんやを見る
        </button>
        <div className="flex gap-3 text-sm font-semibold text-violet-500">
          <Link href={graduatesHref} className="flex-1 rounded-2xl bg-white/70 py-3 shadow-sm">
            卒業生リスト
          </Link>
          <Link href={rankingHref} className="flex-1 rounded-2xl bg-white/70 py-3 shadow-sm">
            ランキング
          </Link>
        </div>
      </div>
    </div>
  );
}
