import type { MapStatus } from "./useMapStatus";
import { calcRank } from "./useMapGame";
import { MapNavLinks } from "./MapParts";
import styles from "./map.module.css";

interface ResultScreenProps {
  finalTime: number;
  finalMiss: number;
  status: MapStatus | null;
  remainingToGraduate: number;
  onRestart: () => void;
}

export default function ResultScreen({
  finalTime,
  finalMiss,
  status,
  remainingToGraduate,
  onRestart,
}: ResultScreenProps) {
  return (
    <div className={styles.centerPage}>
      <div className={styles.deco}>{finalMiss === 0 ? "🏆" : "🏁"}</div>
      <h1 className={styles.title}>地図完成！</h1>
      {finalMiss === 0 && status?.graduated && (
        <div className={styles.gradBadge}>🎓 卒業しました！おめでとう！</div>
      )}
      {finalMiss === 0 && !status?.graduated && (
        <div className={styles.gradBadge}>✨ ノーミスクリア！ 卒業まであと{remainingToGraduate}回</div>
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
      <button className={styles.btnPrimary} onClick={onRestart}>
        もう一度遊ぶ
      </button>
      <MapNavLinks />
    </div>
  );
}
