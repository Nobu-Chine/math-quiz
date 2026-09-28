import { MUNI_DATA, VB_W, VB_H } from "@/data/okinawaMuni";
import { TOTAL } from "./useMapGame";
import styles from "./map.module.css";

interface GameScreenProps {
  elapsed: number;
  doneNames: Set<string>;
  selectedName: string | null;
  wrongFlash: string | null;
  pickerOrder: string[];
  onPick: (name: string) => void;
  onMapClick: (name: string) => void;
}

export default function GameScreen({
  elapsed,
  doneNames,
  selectedName,
  wrongFlash,
  pickerOrder,
  onPick,
  onMapClick,
}: GameScreenProps) {
  return (
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
  );
}
