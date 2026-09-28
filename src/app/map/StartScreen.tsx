import type { MapStatus } from "./useMapStatus";
import { TOTAL } from "./useMapGame";
import { MapNavLinks, MapTitle } from "./MapParts";
import styles from "./map.module.css";

interface StartScreenProps {
  status: MapStatus | null;
  graduationThreshold: number;
  remainingToGraduate: number;
  onStart: () => void;
}

export default function StartScreen({
  status,
  graduationThreshold,
  remainingToGraduate,
  onStart,
}: StartScreenProps) {
  return (
    <div className={styles.centerPage}>
      <MapTitle />
      <p className={styles.lead}>
        下から市町村名を選んで、地図の正しい場所をタップ！
        <br />
        正解するたびに地図が色づいていきます。
        <br />
        全{TOTAL}市町村で地図を完成させよう。
        <br />
        ノーミスクリアを{graduationThreshold}回達成すると卒業だよ！
      </p>
      {status?.graduated ? (
        <div className={styles.gradBadge}>
          🎓 卒業済み({status.graduatedAt ? new Date(status.graduatedAt).toLocaleDateString("ja-JP") : ""})
        </div>
      ) : (
        <div className={styles.progressBadge}>
          ノーミスクリア {status?.perfectCount ?? 0}/{graduationThreshold}回(卒業まであと
          {remainingToGraduate}回)
        </div>
      )}
      <button className={styles.btnPrimary} onClick={onStart}>
        スタート
      </button>
      <MapNavLinks />
    </div>
  );
}
