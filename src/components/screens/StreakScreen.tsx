"use client";

import { useState } from "react";
import type { Question } from "@/lib/questionBank";
import { generateQuestion } from "@/lib/questionBank";
import { isCorrectAnswer } from "@/lib/answer";
import type { AnswerRecord } from "@/lib/quiz-types";

interface StreakScreenProps {
  onFinish: (streak: number, records: AnswerRecord[]) => void;
}

export default function StreakScreen({ onFinish }: StreakScreenProps) {
  const [question, setQuestion] = useState<Question>(() => generateQuestion());
  const [streak, setStreak] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [numericInput, setNumericInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const currentAnswer = question.type === "choice" ? selected ?? "" : numericInput;

  function handleSubmit() {
    if (!currentAnswer) return;
    setCorrect(isCorrectAnswer(question, currentAnswer));
    setSubmitted(true);
  }

  function handleNext() {
    const record: AnswerRecord = { question, userAnswer: currentAnswer, correct };
    const nextRecords = [...records, record];

    if (!correct) {
      onFinish(streak, nextRecords);
      return;
    }

    setRecords(nextRecords);
    setStreak((s) => s + 1);
    setQuestion(generateQuestion());
    setSelected(null);
    setNumericInput("");
    setSubmitted(false);
    setCorrect(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <p className="mb-2 inline-block rounded-full bg-orange-400 px-3 py-1 text-xs font-bold text-white">
          🔥 連続回答モード
        </p>
        <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
          <span>れんぞく正解: {streak}</span>
          <span className="text-violet-500">{question.category}</span>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-md">
        <p className="whitespace-pre-wrap text-xl font-semibold leading-relaxed text-slate-700">
          {question.text}
        </p>
      </div>

      {!submitted && question.type === "choice" && (
        <div className="grid grid-cols-1 gap-3">
          {question.choices?.map((choice) => (
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
            {correct ? "せいかい! 🎉" : "ざんねん…"}
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
            {correct ? "次の問題へ" : "けっかを見る"}
          </button>
        </div>
      )}
    </div>
  );
}
