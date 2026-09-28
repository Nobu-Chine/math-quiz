import Link from "next/link";
import styles from "./map.module.css";

// ログイン画面とスタート画面で共通のタイトル
export function MapTitle() {
  return (
    <>
      <div className={styles.deco}>🌺🗺️</div>
      <h1 className={styles.title}>
        沖縄本島
        <br />
        <span>市町村地図完成ゲーム</span>
      </h1>
    </>
  );
}

// スタート画面と結果画面で共通のリンク
export function MapNavLinks() {
  return (
    <>
      <Link href="/map/graduates" className={styles.btnSecondary}>
        🎓 卒業生リスト
      </Link>
      <Link href="/" className={styles.btnSecondary}>
        クイズ選択にもどる
      </Link>
    </>
  );
}
