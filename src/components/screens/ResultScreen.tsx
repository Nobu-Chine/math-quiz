import type { AnswerRecord, QuizMode } from "@/lib/quiz-types";
import { calcRank, RANK_COLORS } from "@/lib/rank";

interface ResultScreenProps {
  answers: AnswerRecord[];
  mode: QuizMode;
  category?: string | null;
  onRestart: () => void;
  onShowWeakness: () => void;
}

export default function ResultScreen({
  answers,
  mode,
  category,
  onRestart,
  onShowWeakness,
}: ResultScreenProps) {
  const total = answers.length;
  const score = answers.filter((a) => a.correct).length;
  const rank = calcRank(score, total);
  const wrongAnswers = answers.filter((a) => !a.correct);
  const perfect = total > 0 && score === total;
  const graduationPassed = total > 0 && score / total >= 0.8;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="rounded-3xl bg-white p-8 text-center shadow-md">
        {mode === "camp" && (
          <p className="mb-2 inline-block rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-white">
            🏕️ 合宿モード
          </p>
        )}
        {mode === "category" && (
          <p className="mb-2 inline-block rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-white">
            🗂️ カテゴリテスト{category ? `: ${category}` : ""}
          </p>
        )}
        {mode === "graduation" && (
          <p className="mb-2 inline-block rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-bold text-white">
            🎓 卒業テスト
          </p>
        )}
        <p className="text-slate-500">けっか</p>
        <p className="mt-2 text-5xl font-extrabold text-slate-700">
          {score} <span className="text-2xl font-semibold text-slate-400">/ {total}</span>
        </p>
        <p className={`mt-3 text-4xl font-black ${RANK_COLORS[rank]}`}>{rank}</p>
        {mode === "category" && perfect && (
          <p className="mt-3 text-lg font-black text-emerald-500">🎉 カテゴリクリア!</p>
        )}
        {mode === "graduation" && graduationPassed && (
          <p className="mt-3 text-lg font-black text-fuchsia-500">🎓 卒業おめでとう!</p>
        )}
        {mode === "graduation" && !graduationPassed && (
          <p className="mt-3 text-sm font-semibold text-rose-500">
            不合格(80%以上正解で合格・何度でも再挑戦できるよ)
          </p>
        )}
      </div>

      {wrongAnswers.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-500">まちがえた問題</p>
          {wrongAnswers.map((a, i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-violet-500">{a.question.category}</p>
              <p className="mt-1 font-semibold text-slate-700">{a.question.text}</p>
              <p className="mt-2 text-sm text-slate-500">
                あなたのこたえ:{" "}
                <span className="font-semibold text-rose-500">{a.userAnswer || "(未回答)"}</span>
              </p>
              <p className="text-sm text-slate-500">
                正解: <span className="font-semibold text-emerald-600">{String(a.question.answer)}</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">{a.question.explain}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 pb-4">
        <button
          onClick={onRestart}
          className="w-full rounded-2xl bg-violet-500 py-4 text-lg font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95"
        >
          もう一度
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
