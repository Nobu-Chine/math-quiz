"use client";

import { useState } from "react";
import type { Question } from "@/lib/questionBank";
import type { SubjectConfig } from "@/lib/subjects/types";
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

const GRADUATION_PASS_RATE = 0.8;

interface StreakResult {
  streak: number;
  bestStreak: number;
  newBest: boolean;
}

export default function QuizApp({ subject }: { subject: SubjectConfig }) {
  const { generator } = subject;
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
    return fetch(subject.progressApiPath, {
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
        const stats: StatsData = await fetch(subject.statsApiPath, {
          headers: authHeaders(auth.username, auth.password),
        }).then((res) => res.json());
        setQuestions(generator.generateCampQuiz(subject.questionCount, stats));
      } catch {
        setQuestions(generator.generateNormalQuiz(subject.questionCount));
      }
    } else {
      setQuestions(generator.generateNormalQuiz(subject.questionCount));
    }
    setScreen("quiz");
  }

  function startCategoryQuiz(category: string) {
    if (!auth) return;
    setMode("category");
    setActiveCategory(category);
    setAnswers([]);
    setCurrentIndex(0);
    setQuestions(generator.generateCategoryQuiz(category, subject.categoryQuestionCount));
    setScreen("quiz");
  }

  function startGraduationQuiz() {
    if (!auth) return;
    setMode("graduation");
    setActiveCategory(null);
    setAnswers([]);
    setCurrentIndex(0);
    setQuestions(generator.generateGraduationQuiz(subject.graduationQuestionCount));
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
    fetch(subject.statsApiPath, {
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

  const containerClass = `flex min-h-dvh w-full flex-col items-center bg-gradient-to-b ${subject.backgroundClass} px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]`;

  if (!auth) {
    return (
      <div className={containerClass}>
        <div className="flex w-full max-w-md flex-1 flex-col">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex w-full max-w-md flex-1 flex-col">
        {screen === "top" && (
          <TopScreen
            gradeLabel={subject.gradeLabel}
            title={subject.title}
            description={subject.description}
            graduatesHref={subject.graduatesHref}
            rankingHref={subject.rankingHref}
            onStart={() => startQuiz("normal")}
            onStartCamp={() => startQuiz("camp")}
            onShowCategorySelect={() => setScreen("category-select")}
            onStartStreak={startStreak}
            onShowWeakness={() => setScreen("weakness")}
          />
        )}
        {screen === "loading" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-4xl">{subject.loadingEmoji}</p>
            <p className="font-semibold text-slate-600">にがてぶんやをチェック中…</p>
          </div>
        )}
        {screen === "category-select" && auth && (
          <CategorySelectScreen
            username={auth.username}
            password={auth.password}
            categories={subject.categories}
            progressApiPath={subject.progressApiPath}
            graduationQuestionCount={subject.graduationQuestionCount}
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
            generateQuestion={generator.generateQuestion}
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
            statsApiPath={subject.statsApiPath}
            onBack={() => setScreen("top")}
          />
        )}
      </div>
    </div>
  );
}
