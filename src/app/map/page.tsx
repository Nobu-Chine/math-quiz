"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MUNI_DATA, VB_W, VB_H } from "@/data/okinawaMuni";
import { useAuth } from "@/context/AuthContext";
import { authHeaders } from "@/lib/auth-headers";
import LoginForm from "@/components/LoginForm";
import styles from "./map.module.css";

const TOTAL = MUNI_DATA.length;
const GRADUATION_THRESHOLD = 3;

type Phase = "start" | "game" | "result";

interface MapStatus {
  perfectCount: number;
  graduated: boolean;
  graduatedAt: string | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcRank(time: number, miss: number): string {
  if (time <= 60 && miss === 0) return "S";
  if (time <= 90 && miss <= 3) return "A";
  if (time <= 150 && miss <= 8) return "B";
  return "C";
}

export default function MapQuizPage() {
  const { auth, ready } = useAuth();

  const [phase, setPhase] = useState<Phase>("start");
  // どのユーザーの進捗かを持たせることで、ログアウト/別ユーザー再ログイン時の古い表示を防ぐ
  const [statusEntry, setStatusEntry] = useState<{ user: string; data: MapStatus } | null>(null);
  const status = auth && statusEntry?.user === auth.username ? statusEntry.data : null;

  // ゲーム中の状態
  const [doneNames, setDoneNames] = useState<Set<string>>(new Set());
  const [pickerOrder, setPickerOrder] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [missCount, setMissCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; kind: "ok" | "ng" } | null>(null);

  // 結果画面用
  const [finalTime, setFinalTime] = useState(0);
  const [finalMiss, setFinalMiss] = useState(0);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);

  // ログイン中ならノーミスクリア進捗を取得(スタート画面の表示用)
  useEffect(() => {
    if (!auth) return;
    const username = auth.username;
    let cancelled = false;
    fetch("/api/map/progress", { headers: authHeaders(auth.username, auth.password) })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MapStatus | null) => {
        if (!cancelled && data) setStatusEntry({ user: username, data });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [auth]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    };
  }, []);

  function showFeedback(text: string, kind: "ok" | "ng") {
    setFeedback({ text, kind });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 900);
  }

  function startGame() {
    setDoneNames(new Set());
    setPickerOrder(shuffle(MUNI_DATA.map((m) => m.name)));
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

  const finishGame = useCallback(
    (finalMissCount: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      const totalTime = (Date.now() - startTimeRef.current) / 1000;
      setFinalTime(totalTime);
      setFinalMiss(finalMissCount);

      // ノーミスクリアのみサーバーに記録(卒業判定込み)
      if (finalMissCount === 0 && auth) {
        const username = auth.username;
        fetch("/api/map/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: auth.username,
            password: auth.password,
            missCount: finalMissCount,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: MapStatus | null) => {
            if (data) setStatusEntry({ user: username, data });
          })
          .catch(() => {});
      }

      setTimeout(() => setPhase("result"), 700);
    },
    [auth]
  );

  function onPick(name: string) {
    if (finishedRef.current) return;
    if (selectedName === name) {
      setSelectedName(null);
      return;
    }
    setSelectedName(name);
  }

  function onMapClick(clickedName: string) {
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
      setPickerOrder(shuffle(MUNI_DATA.map((m) => m.name).filter((n) => !nextDone.has(n))));
      setSelectedName(null);
      showFeedback("正解！", "ok");
      if (nextDone.size === TOTAL) {
        finishGame(missCount);
      }
    } else {
      setMissCount((c) => c + 1);
      showFeedback("ちがいます！もう一度", "ng");
      setWrongFlash(clickedName);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = setTimeout(() => setWrongFlash(null), 350);
    }
  }

  if (!ready) return <div className={styles.root} />;

  if (!auth) {
    return (
      <div className={styles.root}>
        <div className={styles.centerPage}>
          <div className={styles.deco}>🌺🗺️</div>
          <h1 className={styles.title}>
            沖縄本島
            <br />
            <span>市町村地図完成ゲーム</span>
          </h1>
          <p className={styles.lead}>遊ぶにはログインしてね(算数クイズと同じアカウントだよ)</p>
          <div className={styles.loginCard}>
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }

  const remainingToGraduate = Math.max(0, GRADUATION_THRESHOLD - (status?.perfectCount ?? 0));

  return (
    <div className={styles.root}>
      {phase === "start" && (
        <div className={styles.centerPage}>
          <div className={styles.deco}>🌺🗺️</div>
          <h1 className={styles.title}>
            沖縄本島
            <br />
            <span>市町村地図完成ゲーム</span>
          </h1>
          <p className={styles.lead}>
            下から市町村名を選んで、地図の正しい場所をタップ！
            <br />
            正解するたびに地図が色づいていきます。
            <br />
            全{TOTAL}市町村で地図を完成させよう。
            <br />
            ノーミスクリアを{GRADUATION_THRESHOLD}回達成すると卒業だよ！
          </p>
          {status?.graduated ? (
            <div className={styles.gradBadge}>
              🎓 卒業済み({status.graduatedAt ? new Date(status.graduatedAt).toLocaleDateString("ja-JP") : ""})
            </div>
          ) : (
            <div className={styles.progressBadge}>
              ノーミスクリア {status?.perfectCount ?? 0}/{GRADUATION_THRESHOLD}回(卒業まであと
              {remainingToGraduate}回)
            </div>
          )}
          <button className={styles.btnPrimary} onClick={startGame}>
            スタート
          </button>
          <Link href="/map/graduates" className={styles.btnSecondary}>
            🎓 卒業生リスト
          </Link>
          <Link href="/" className={styles.btnSecondary}>
            クイズ選択にもどる
          </Link>
        </div>
      )}

      {phase === "game" && (
        <div className={styles.gamePage}>
          <div className={styles.gameHeader}>
            <div className={styles.hudRow}>
              <div className={styles.brand}>
                OKINAWA<b>市町村地図完成</b>
              </div>
              <div className={styles.hud}>
                <div className={styles.chip}>
                  ⏱ <span className={styles.chipVal}>{elapsed.toFixed(1)}</span>
                </div>
                <div className={styles.chip}>
                  ✅ <span className={styles.chipVal}>{doneNames.size}</span>/{TOTAL}
                </div>
              </div>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${(doneNames.size / TOTAL) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.statusLine}>
            {selectedName ? (
              <div>
                <span className={styles.activeLbl}>これはどこ？</span>
                <span className={styles.activeName}>{selectedName}</span>
              </div>
            ) : (
              <div className={styles.idleMsg}>下のリストから市町村名を選んでね</div>
            )}
          </div>

          <div className={styles.mapWrap}>
            <svg
              className={styles.mapSvg}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              {MUNI_DATA.map((m) => (
                <path
                  key={m.name}
                  d={m.d}
                  className={`${styles.muniPath} ${doneNames.has(m.name) ? styles.muniDone : ""} ${
                    wrongFlash === m.name ? styles.muniWrong : ""
                  }`}
                  onClick={() => onMapClick(m.name)}
                />
              ))}
              {MUNI_DATA.map((m) => (
                <text
                  key={m.name}
                  x={m.cx}
                  y={m.cy}
                  className={`${styles.muniLabel} ${doneNames.has(m.name) ? styles.muniLabelShow : ""}`}
                >
                  {m.name}
                </text>
              ))}
            </svg>
          </div>

          <div className={styles.picker}>
            <div className={styles.pickerLabel}>① 市町村名を選択 → ② 地図をタップ</div>
            <div className={styles.pickerGrid}>
              {pickerOrder.map((name) => (
                <button
                  key={name}
                  className={`${styles.nameBtn} ${selectedName === name ? styles.nameBtnSelected : ""}`}
                  onClick={() => onPick(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className={styles.centerPage}>
          <div className={styles.deco}>{finalMiss === 0 ? "🏆" : "🏁"}</div>
          <h1 className={styles.title}>地図完成！</h1>
          {finalMiss === 0 && status?.graduated && (
            <div className={styles.gradBadge}>🎓 卒業しました！おめでとう！</div>
          )}
          {finalMiss === 0 && !status?.graduated && (
            <div className={styles.gradBadge}>
              ✨ ノーミスクリア！ 卒業まであと{remainingToGraduate}回
            </div>
          )}
          {finalMiss > 0 && (
            <div className={styles.progressBadge}>ノーミスクリアを目指そう！(ミス0回で記録される)</div>
          )}
          <div className={styles.rankBadge}>RANK {calcRank(finalTime, finalMiss)}</div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{finalTime.toFixed(1)}</div>
              <div className={styles.statLbl}>タイム（秒）</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{finalMiss}</div>
              <div className={styles.statLbl}>ミス回数</div>
            </div>
          </div>
          <button className={styles.btnPrimary} onClick={startGame}>
            もう一度遊ぶ
          </button>
          <Link href="/map/graduates" className={styles.btnSecondary}>
            🎓 卒業生リスト
          </Link>
          <Link href="/" className={styles.btnSecondary}>
            クイズ選択にもどる
          </Link>
        </div>
      )}

      <div
        className={`${styles.feedback} ${feedback ? styles.feedbackShow : ""} ${
          feedback?.kind === "ok" ? styles.feedbackOk : styles.feedbackNg
        }`}
      >
        {feedback?.text ?? ""}
      </div>
    </div>
  );
}
