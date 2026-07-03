"use client";

import { useState } from "react";
import { generateQuiz } from "@/lib/questionBank";
import type { Question } from "@/lib/questionBank";
import type { AnswerRecord, Screen } from "@/lib/quiz-types";
import type { QuizResultEntry } from "@/lib/stats";
import TopScreen from "@/components/screens/TopScreen";
import QuizScreen from "@/components/screens/QuizScreen";
import ResultScreen from "@/components/screens/ResultScreen";
import WeaknessScreen from "@/components/screens/WeaknessScreen";

const QUESTION_COUNT = 10;

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>("top");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  function startQuiz() {
    setQuestions(generateQuiz(QUESTION_COUNT));
    setCurrentIndex(0);
    setAnswers([]);
    setScreen("quiz");
  }

  function submitResults(records: AnswerRecord[]) {
    const results: QuizResultEntry[] = records.map((r) => ({
      category: r.question.category,
      correct: r.correct,
    }));
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results }),
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
        {screen === "top" && (
          <TopScreen onStart={startQuiz} onShowWeakness={() => setScreen("weakness")} />
        )}
        {screen === "quiz" && questions[currentIndex] && (
          <QuizScreen
            key={currentIndex}
            question={questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onNext={handleAnswerNext}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            answers={answers}
            onRestart={startQuiz}
            onShowWeakness={() => setScreen("weakness")}
          />
        )}
        {screen === "weakness" && <WeaknessScreen onBack={() => setScreen("top")} />}
      </div>
    </div>
  );
}
