"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ログイン中のみ表示される全ページ共通の細いヘッダーバー。
// 各ページは上部に十分なpaddingを持つ前提(既存ページのpt-[max(2.5rem,...)]の帯に重なる)。
export default function SiteHeader() {
  const { auth, ready, logout } = useAuth();
  if (!ready || !auth) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-between gap-3 bg-slate-900/70 px-3 text-xs text-white backdrop-blur">
      <span className="truncate">
        ログイン中: <b>{auth.username}</b> さん
      </span>
      <div className="flex shrink-0 items-center gap-3">
        <Link href="/" className="font-semibold text-amber-300 active:text-amber-200">
          クイズ選択
        </Link>
        <button onClick={logout} className="font-semibold text-sky-300 active:text-sky-200">
          ログアウト
        </button>
      </div>
    </header>
  );
}
