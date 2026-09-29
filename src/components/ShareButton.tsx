"use client";

import { useState } from "react";

const SITE_URL = "https://math-quiz-beige-iota.vercel.app/";

// ホーム画面から開くとアドレスバーが無く共有できないため、サイト内に共有ボタンを置く。
// スマホは共有シート(LINE等)を開き、非対応ブラウザではURLをコピーする。
export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "クイズポータル", url: SITE_URL });
      } catch {
        // 共有シートを閉じただけなので何もしない
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("このURLをコピーしてね", SITE_URL);
    }
  }

  return (
    <button
      onClick={share}
      className="w-full rounded-2xl border-2 border-slate-300 bg-white/70 py-3 text-base font-bold text-slate-600 transition-transform active:scale-95"
    >
      {copied ? "URLをコピーしたよ" : "友だちにシェアする"}
    </button>
  );
}
