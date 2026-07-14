"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/questionBank";
import { isCorrectAnswer } from "@/lib/answer";
import type { AnswerRecord, QuizMode } from "@/lib/quiz-types";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface QuizScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  mode: QuizMode;
  onNext: (record: AnswerRecord) => void;
  onBack: () => void;
}

export default function QuizScreen({
  question,
  questionNumber,
  totalQuestions,
  mode,
  onNext,
  onBack,
}: QuizScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [numericInput, setNumericInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  // 選択肢データ内での正解の位置に関わらず、毎回ランダムな順番で表示する
  const displayChoices = useMemo(
    () => (question.choices ? shuffle(question.choices) : undefined),
    [question]
  );

  const currentAnswer = question.type === "choice" ? selected ?? "" : numericInput;

  function handleSubmit() {
    if (!currentAnswer) return;
    setCorrect(isCorrectAnswer(question, currentAnswer));
    setSubmitted(true);
  }

  function handleNext() {
    onNext({ question, userAnswer: currentAnswer, correct });
  }

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <button
          onClick={onBack}
          className="mb-2 text-sm font-semibold text-slate-400 active:text-slate-500"
        >
          ← やめる
        </button>
        {mode === "camp" && (
          <p className="mb-2 inline-block rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-white">
            🏕️ 合宿モード
          </p>
        )}
        {mode === "category" && (
          <p className="mb-2 inline-block rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-white">
            🗂️ カテゴリテスト
          </p>
        )}
        {mode === "graduation" && (
          <p className="mb-2 inline-block rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-bold text-white">
            🎓 卒業テスト
          </p>
        )}
        <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
          <span>
            もんだい {questionNumber} / {totalQuestions}
          </span>
          <span className="text-violet-500">{question.category}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/70">
          <div
            className="h-2 rounded-full bg-violet-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-md">
        <p className="whitespace-pre-wrap text-xl font-semibold leading-relaxed text-slate-700">
          {question.text}
        </p>
      </div>

      {!submitted && question.type === "choice" && (
        <div className="grid grid-cols-1 gap-3">
          {displayChoices?.map((choice) => (
            <button
              key={choice}
              onClick={() => setSelected(choice)}
              className={`w-full rounded-2xl border-2 py-4 text-lg font-semibold transition-colors ${
                selected === choice
                  ? "border-violet-500 bg-violet-50 text-violet-600"
                  : "border-transparent bg-white text-slate-600 shadow-sm"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      {!submitted && question.type === "numeric" && (
        <input
          type="number"
          inputMode="decimal"
          value={numericInput}
          onChange={(e) => setNumericInput(e.target.value)}
          placeholder="こたえを入力"
          className="w-full rounded-2xl border-2 border-white bg-white px-5 py-4 text-center text-2xl font-bold text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none"
        />
      )}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!currentAnswer}
          className="w-full rounded-2xl bg-violet-500 py-4 text-lg font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95 disabled:opacity-40"
        >
          こたえる
        </button>
      )}

      {submitted && (
        <div className={`rounded-3xl p-6 shadow-md ${correct ? "bg-emerald-50" : "bg-rose-50"}`}>
          <p className={`text-xl font-bold ${correct ? "text-emerald-600" : "text-rose-600"}`}>
            {correct ? "せいかい！ 🎉" : "ざんねん…"}
          </p>
          {!correct && (
            <p className="mt-1 text-slate-600">
              正解: <span className="font-semibold">{question.answer}</span>
            </p>
          )}
          <p className="mt-3 text-slate-600">{question.explain}</p>
          <button
            onClick={handleNext}
            className="mt-5 w-full rounded-2xl bg-violet-500 py-4 text-lg font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95"
          >
            {questionNumber === totalQuestions ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      )}
    </div>
  );
}
