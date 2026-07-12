"use client";

import { useState } from "react";
import type { Question } from "@/lib/questionBank";
import {
  generateNormalQuiz,
  generateCampQuiz,
  generateCategoryQuiz,
  generateGraduationQuiz,
} from "@/lib/quiz-generator";
import type { AnswerRecord, QuizMode, Screen } from "@/lib/quiz-types";
import type { QuizResultEntry, StatsData } from "@/lib/stats";
import { authHeaders } from "@/lib/auth-headers";
import LoginScreen from "@/components/screens/LoginScreen";
import TopScreen from "@/components/screens/TopScreen";
import QuizScreen from "@/components/screens/QuizScreen";
import ResultScreen from "@/components/screens/ResultScreen";
import WeaknessScreen from "@/components/screens/WeaknessScreen";
import CategorySelectScreen from "@/components/screens/CategorySelectScreen";
import StreakScreen from "@/components/screens/StreakScreen";
import StreakResultScreen from "@/components/screens/StreakResultScreen";

const QUESTION_COUNT = 5;
const CATEGORY_QUESTION_COUNT = 10;
const GRADUATION_QUESTION_COUNT = 15;

interface StreakResult {
  streak: number;
  bestStreak: number;
  newBest: boolean;
}

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>("login");
  const [mode, setMode] = useState<QuizMode>("normal");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [auth, setAuth] = useState<{ username: string; password: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [streakResult, setStreakResult] = useState<StreakResult>({
    streak: 0,
    bestStreak: 0,
    newBest: false,
  });

  function handleLogin(username: string, password: string) {
    setAuth({ username, password });
    setScreen("top");
  }

  function postProgress(body: {
    categoryClear?: string;
    graduate?: boolean;
    streak?: number;
  }): Promise<{ bestStreak: number; newBest: boolean } | null> {
    if (!auth) return Promise.resolve(null);
    return fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: auth.username, password: auth.password, ...body }),
    })
      .then((res) => res.json())
      .catch(() => null);
  }

  async function startQuiz(nextMode: QuizMode) {
    if (!auth) return;
    setMode(nextMode);
    setActiveCategory(null);
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

  function startCategoryQuiz(category: string) {
    if (!auth) return;
    setMode("category");
    setActiveCategory(category);
    setAnswers([]);
    setCurrentIndex(0);
    setQuestions(generateCategoryQuiz(category, CATEGORY_QUESTION_COUNT));
    setScreen("quiz");
  }

  function startGraduationQuiz() {
    if (!auth) return;
    setMode("graduation");
    setActiveCategory(null);
    setAnswers([]);
    setCurrentIndex(0);
    setQuestions(generateGraduationQuiz(GRADUATION_QUESTION_COUNT));
    setScreen("quiz");
  }

  function startStreak() {
    if (!auth) return;
    setMode("streak");
    setActiveCategory(null);
    setScreen("streak");
  }

  function restartCurrent() {
    if (mode === "category" && activeCategory) {
      startCategoryQuiz(activeCategory);
    } else if (mode === "graduation") {
      startGraduationQuiz();
    } else if (mode === "streak") {
      startStreak();
    } else {
      startQuiz(mode);
    }
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
      const perfect = nextAnswers.length > 0 && nextAnswers.every((a) => a.correct);
      if (mode === "category" && activeCategory && perfect) {
        postProgress({ categoryClear: activeCategory });
      } else if (mode === "graduation" && perfect) {
        postProgress({ graduate: true });
      }
      setScreen("result");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  async function handleStreakFinish(streak: number, records: AnswerRecord[]) {
    submitResults(records);
    const result = await postProgress({ streak });
    setStreakResult({
      streak,
      bestStreak: result?.bestStreak ?? streak,
      newBest: result?.newBest ?? false,
    });
    setScreen("streak-result");
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-sky-100 via-violet-100 to-rose-100 px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md flex-1 flex-col">
        {screen === "login" && <LoginScreen onLogin={handleLogin} />}
        {screen === "top" && (
          <TopScreen
            onStart={() => startQuiz("normal")}
            onStartCamp={() => startQuiz("camp")}
            onShowCategorySelect={() => setScreen("category-select")}
            onStartStreak={startStreak}
            onShowWeakness={() => setScreen("weakness")}
          />
        )}
        {screen === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-4xl">🏕️</p>
            <p className="font-semibold text-slate-600">にがてぶんやをチェック中…</p>
          </div>
        )}
        {screen === "category-select" && auth && (
          <CategorySelectScreen
            username={auth.username}
            password={auth.password}
            onSelectCategory={startCategoryQuiz}
            onStartGraduation={startGraduationQuiz}
            onBack={() => setScreen("top")}
          />
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
        {screen === "streak" && <StreakScreen onFinish={handleStreakFinish} />}
        {screen === "streak-result" && (
          <StreakResultScreen
            streak={streakResult.streak}
            bestStreak={streakResult.bestStreak}
            newBest={streakResult.newBest}
            onRestart={startStreak}
            onBackToTop={() => setScreen("top")}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            answers={answers}
            mode={mode}
            category={activeCategory}
            onRestart={restartCurrent}
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
