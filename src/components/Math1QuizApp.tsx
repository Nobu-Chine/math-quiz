"use client";

import { useState } from "react";
import type { Question } from "@/lib/questionBank";
import {
  CATEGORIES,
  generateNormalQuiz,
  generateCampQuiz,
  generateCategoryQuiz,
  generateGraduationQuiz,
  generateQuestion,
} from "@/lib/math1-quiz-generator";
import type { AnswerRecord, QuizMode, Screen } from "@/lib/quiz-types";
import type { QuizResultEntry, StatsData } from "@/lib/stats";
import { authHeaders } from "@/lib/auth-headers";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";
import TopScreen from "@/components/screens/TopScreen";
import QuizScreen from "@/components/screens/QuizScreen";
import ResultScreen from "@/components/screens/ResultScreen";
import WeaknessScreen from "@/components/screens/WeaknessScreen";
import CategorySelectScreen from "@/components/screens/CategorySelectScreen";
import StreakScreen from "@/components/screens/StreakScreen";
import StreakResultScreen from "@/components/screens/StreakResultScreen";

const QUESTION_COUNT = 10;
const CATEGORY_QUESTION_COUNT = 6;
const GRADUATION_QUESTION_COUNT = CATEGORIES.length; // 18
const GRADUATION_PASS_RATE = 0.8;

const API_PROGRESS = "/api/math1/progress";
const API_STATS = "/api/math1/stats";

interface StreakResult {
  streak: number;
  bestStreak: number;
  newBest: boolean;
}

export default function Math1QuizApp() {
  const { auth, ready } = useAuth();
  const [screen, setScreen] = useState<Screen>("top");
  const [mode, setMode] = useState<QuizMode>("normal");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [streakResult, setStreakResult] = useState<StreakResult>({
    streak: 0,
    bestStreak: 0,
    newBest: false,
  });

  function postProgress(body: {
    categoryClear?: string;
    graduate?: boolean;
    streak?: number;
  }): Promise<{ bestStreak: number; newBest: boolean } | null> {
    if (!auth) return Promise.resolve(null);
    return fetch(API_PROGRESS, {
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
        const stats: StatsData = await fetch(API_STATS, {
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
    fetch(API_STATS, {
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
      const correctCount = nextAnswers.filter((a) => a.correct).length;
      const passedGraduation =
        nextAnswers.length > 0 && correctCount / nextAnswers.length >= GRADUATION_PASS_RATE;
      if (mode === "category" && activeCategory && perfect) {
        postProgress({ categoryClear: activeCategory });
      } else if (mode === "graduation" && passedGraduation) {
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

  if (!ready) return null;

  if (!auth) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-amber-100 via-orange-100 to-rose-100 px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex w-full max-w-md flex-1 flex-col">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-amber-100 via-orange-100 to-rose-100 px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md flex-1 flex-col">
        {screen === "top" && (
          <TopScreen
            gradeLabel="中学1年"
            title="数学クイズ"
            description={
              "単元ごとに練習して力をつけ\n合宿モードで苦手を克服\n全単元を制覇して、総合テストに挑戦しよう！"
            }
            graduatesHref="/math1/graduates"
            rankingHref="/math1/ranking"
            onStart={() => startQuiz("normal")}
            onStartCamp={() => startQuiz("camp")}
            onShowCategorySelect={() => setScreen("category-select")}
            onStartStreak={startStreak}
            onShowWeakness={() => setScreen("weakness")}
          />
        )}
        {screen === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-4xl">📐</p>
            <p className="font-semibold text-slate-600">にがてぶんやをチェック中…</p>
          </div>
        )}
        {screen === "category-select" && auth && (
          <CategorySelectScreen
            username={auth.username}
            password={auth.password}
            categories={CATEGORIES}
            progressApiPath={API_PROGRESS}
            graduationQuestionCount={GRADUATION_QUESTION_COUNT}
            passRatePercent={Math.round(GRADUATION_PASS_RATE * 100)}
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
            onBack={() => setScreen("top")}
          />
        )}
        {screen === "streak" && (
          <StreakScreen
            generateQuestion={generateQuestion}
            onFinish={handleStreakFinish}
            onBack={() => setScreen("top")}
          />
        )}
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
            statsApiPath={API_STATS}
            onBack={() => setScreen("top")}
          />
        )}
      </div>
    </div>
  );
}
