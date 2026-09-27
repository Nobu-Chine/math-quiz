"use client";

import QuizApp from "@/components/QuizApp";
import { mathSubject } from "@/lib/subjects/math";

// 問題を作る関数を QuizApp に渡すため、このページはブラウザ側で動かす
export default function Home() {
  return <QuizApp subject={mathSubject} />;
}
