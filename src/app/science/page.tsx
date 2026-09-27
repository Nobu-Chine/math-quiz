"use client";

import QuizApp from "@/components/QuizApp";
import { scienceSubject } from "@/lib/subjects/science";

// 問題を作る関数を QuizApp に渡すため、このページはブラウザ側で動かす
export default function ScienceHome() {
  return <QuizApp subject={scienceSubject} />;
}
