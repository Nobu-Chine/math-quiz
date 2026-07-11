"use client";

import { useState } from "react";
import type { Question } from "@/lib/questionBank";
import { generateNormalQuiz, generateCampQuiz } from "@/lib/quiz-generator";
import type { AnswerRecord, QuizMode, Screen } from "@/lib/quiz-types";
import type { QuizResultEntry, StatsData } from "@/lib/stats";
import { authHeaders } from "@/lib/auth-headers";
import LoginScreen from "@/components/screens/LoginScreen";
import TopScreen from "@/components/screens/TopScreen";
import QuizScreen from "@/components/screens/QuizScreen";
import ResultScreen from "@/components/screens/ResultScreen";
import WeaknessScreen from "@/components/screens/WeaknessScreen";

const QUESTION_COUNT = 5;

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>("login");
  const [mode, setMode] = useState<QuizMode>("normal");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [auth, setAuth] = useState<{ username: string; password: string } | null>(null);

  function handleLogin(username: string, password: string) {
    setAuth({ username, password });
    setScreen("top");
  }

  async function startQuiz(nextMode: QuizMode) {
    if (!auth) return;
    setMode(nextMode);
    setAnswers([]);
    setCurrentIndex(0);

    if (nextMode === "camp") {
      setScreen("loading");
      try {
        const stats: StatsData = await fetch("/api/stats", {
          headers: authHeaders(auth.username, auth.password),
        }).then((res) => res.json());
        setQuestions(generateCampQuiz(QUESTION_COUNT, stats));
      } catch {
        setQuestions(generateNormalQuiz(QUESTION_COUNT));
      }
    } else {
      setQuestions(generateNormalQuiz(QUESTION_COUNT));
    }
    setScreen("quiz");
  }

  function submitResults(records: AnswerRecord[]) {
    if (!auth) return;
    const results: QuizResultEntry[] = records.map((r) => ({
      category: r.question.category,
      correct: r.correct,
    }));
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: auth.username, password: auth.password, results }),
    }).catch(() => {});
  }

  function handleAnswerNext(record: AnswerRecord) {
    const nextAnswers = [...answers, record];
    setAnswers(nextAnswers);

    if (currentIndex + 1 >= questions.length) {
      submitResults(nextAnswers);
      setScreen("result");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-sky-100 via-violet-100 to-rose-100 px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md flex-1 flex-col">
        {screen === "login" && <LoginScreen onLogin={handleLogin} />}
        {screen === "top" && (
          <TopScreen
            onStart={() => startQuiz("normal")}
            onStartCamp={() => startQuiz("camp")}
            onShowWeakness={() => setScreen("weakness")}
          />
        )}
        {screen === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-4xl">🏕️</p>
            <p className="font-semibold text-slate-600">にがてぶんやをチェック中…</p>
          </div>
        )}
        {screen === "quiz" && questions[currentIndex] && (
          <QuizScreen
            key={currentIndex}
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            mode={mode}
            onNext={handleAnswerNext}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            answers={answers}
            mode={mode}
            onRestart={() => startQuiz(mode)}
            onShowWeakness={() => setScreen("weakness")}
          />
        )}
        {screen === "weakness" && auth && (
          <WeaknessScreen
            username={auth.username}
            password={auth.password}
            onBack={() => setScreen("top")}
          />
        )}
      </div>
    </div>
  );
}
