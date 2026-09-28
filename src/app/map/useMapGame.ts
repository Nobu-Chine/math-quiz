"use client";

import { useEffect, useRef, useState } from "react";
import { MUNI_DATA } from "@/data/okinawaMuni";
import { shuffle } from "@/lib/shuffle";

export const TOTAL = MUNI_DATA.length;

export type Phase = "start" | "game" | "result";
export type Feedback = { text: string; kind: "ok" | "ng" };

export function calcRank(time: number, miss: number): string {
  if (time <= 60 && miss === 0) return "S";
  if (time <= 90 && miss <= 3) return "A";
  if (time <= 150 && miss <= 8) return "B";
  return "C";
}

function shuffledNames(exclude: Set<string> = new Set()) {
  return shuffle(MUNI_DATA.map((m) => m.name).filter((n) => !exclude.has(n)));
}

// 地図クイズのゲーム進行(タイマー・正誤判定・終了判定)。表示は持たない
export function useMapGame({ onFinish }: { onFinish: (missCount: number) => void }) {
  const [phase, setPhase] = useState<Phase>("start");

  // ゲーム中の状態
  const [doneNames, setDoneNames] = useState<Set<string>>(new Set());
  const [pickerOrder, setPickerOrder] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [missCount, setMissCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // 結果画面用
  const [finalTime, setFinalTime] = useState(0);
  const [finalMiss, setFinalMiss] = useState(0);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    };
  }, []);

  function showFeedback(text: string, kind: Feedback["kind"]) {
    setFeedback({ text, kind });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 900);
  }

  function start() {
    setDoneNames(new Set());
    setPickerOrder(shuffledNames());
    setSelectedName(null);
    setMissCount(0);
    setElapsed(0);
    setWrongFlash(null);
    setFeedback(null);
    finishedRef.current = false;
    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 100);
    setPhase("game");
  }

  function finish(finalMissCount: number) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setFinalTime((Date.now() - startTimeRef.current) / 1000);
    setFinalMiss(finalMissCount);
    onFinish(finalMissCount);
    setTimeout(() => setPhase("result"), 700);
  }

  // 下のリストで市町村名を選ぶ(同じ名前をもう一度押すと選択解除)
  function pick(name: string) {
    if (finishedRef.current) return;
    setSelectedName(selectedName === name ? null : name);
  }

  // 地図上の市町村をタップ
  function clickMap(clickedName: string) {
    if (finishedRef.current) return;
    if (!selectedName) {
      showFeedback("まず市町村名を選んでね", "ng");
      return;
    }
    if (doneNames.has(clickedName)) return;

    if (clickedName === selectedName) {
      const nextDone = new Set(doneNames);
      nextDone.add(clickedName);
      setDoneNames(nextDone);
      setPickerOrder(shuffledNames(nextDone));
      setSelectedName(null);
      showFeedback("正解！", "ok");
      if (nextDone.size === TOTAL) {
        finish(missCount);
      }
    } else {
      setMissCount((c) => c + 1);
      showFeedback("ちがいます！もう一度", "ng");
      setWrongFlash(clickedName);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = setTimeout(() => setWrongFlash(null), 350);
    }
  }

  return {
    phase,
    doneNames,
    pickerOrder,
    selectedName,
    elapsed,
    wrongFlash,
    feedback,
    finalTime,
    finalMiss,
    start,
    pick,
    clickMap,
  };
}
