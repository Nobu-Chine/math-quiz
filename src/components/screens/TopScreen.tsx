interface TopScreenProps {
  onStart: () => void;
  onStartCamp: () => void;
  onShowWeakness: () => void;
}

export default function TopScreen({ onStart, onStartCamp, onShowWeakness }: TopScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
      <div>
        <p className="text-sm font-semibold tracking-wide text-violet-500">6年生</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-700">算数ふくしゅうクイズ</h1>
        <p className="mt-3 text-slate-500">5問チャレンジして、にがてを見つけよう</p>
      </div>
      <div className="flex w-full flex-col gap-4">
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-violet-500 py-5 text-xl font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95"
        >
          スタート
        </button>
        <button
          onClick={onStartCamp}
          className="w-full rounded-2xl bg-orange-400 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition-transform active:scale-95"
        >
          🏕️ 合宿モード(にがて集中)
        </button>
        <button
          onClick={onShowWeakness}
          className="w-full rounded-2xl bg-white py-4 text-lg font-semibold text-violet-500 shadow-md transition-transform active:scale-95"
        >
          📊 にがてぶんやを見る
        </button>
      </div>
    </div>
  );
}
