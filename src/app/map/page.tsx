"use client";

import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";
import { useMapStatus } from "./useMapStatus";
import { useMapGame } from "./useMapGame";
import { MapTitle } from "./MapParts";
import StartScreen from "./StartScreen";
import GameScreen from "./GameScreen";
import ResultScreen from "./ResultScreen";
import styles from "./map.module.css";

const GRADUATION_THRESHOLD = 3;

export default function MapQuizPage() {
  const { auth, ready } = useAuth();
  const { status, recordPerfectClear } = useMapStatus(auth);
  const game = useMapGame({
    onFinish: (missCount) => {
      // ノーミスクリアのみサーバーに記録
      if (missCount === 0) recordPerfectClear();
    },
  });

  if (!ready) return <div className={styles.root} />;

  if (!auth) {
    return (
      <div className={styles.root}>
        <div className={styles.centerPage}>
          <MapTitle />
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
      {game.phase === "start" && (
        <StartScreen
          status={status}
          graduationThreshold={GRADUATION_THRESHOLD}
          remainingToGraduate={remainingToGraduate}
          onStart={game.start}
        />
      )}

      {game.phase === "game" && (
        <GameScreen
          elapsed={game.elapsed}
          doneNames={game.doneNames}
          selectedName={game.selectedName}
          wrongFlash={game.wrongFlash}
          pickerOrder={game.pickerOrder}
          onPick={game.pick}
          onMapClick={game.clickMap}
        />
      )}

      {game.phase === "result" && (
        <ResultScreen
          finalTime={game.finalTime}
          finalMiss={game.finalMiss}
          status={status}
          remainingToGraduate={remainingToGraduate}
          onRestart={game.start}
        />
      )}

      <div
        className={`${styles.feedback} ${game.feedback ? styles.feedbackShow : ""} ${
          game.feedback?.kind === "ok" ? styles.feedbackOk : styles.feedbackNg
        }`}
      >
        {game.feedback?.text ?? ""}
      </div>
    </div>
  );
}
