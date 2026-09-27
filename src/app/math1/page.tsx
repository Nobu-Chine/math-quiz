"use client";

import QuizApp from "@/components/QuizApp";
import { math1Subject } from "@/lib/subjects/math1";

// 問題を作る関数を QuizApp に渡すため、このページはブラウザ側で動かす
export default function Math1Home() {
  return <QuizApp subject={math1Subject} />;
}
