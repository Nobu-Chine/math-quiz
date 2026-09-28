"use client";

import { useEffect, useState } from "react";
import type { AuthCredentials } from "@/context/AuthContext";
import { authHeaders } from "@/lib/auth-headers";

export interface MapStatus {
  perfectCount: number;
  graduated: boolean;
  graduatedAt: string | null;
}

// ノーミスクリア回数・卒業状況の取得と記録
export function useMapStatus(auth: AuthCredentials | null) {
  // どのユーザーの進捗かを持たせることで、ログアウト/別ユーザー再ログイン時の古い表示を防ぐ
  const [statusEntry, setStatusEntry] = useState<{ user: string; data: MapStatus } | null>(null);
  const status = auth && statusEntry?.user === auth.username ? statusEntry.data : null;

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

  // ノーミスクリアをサーバーに記録(卒業判定込み)
  function recordPerfectClear() {
    if (!auth) return;
    const username = auth.username;
    fetch("/api/map/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: auth.username, password: auth.password, missCount: 0 }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MapStatus | null) => {
        if (data) setStatusEntry({ user: username, data });
      })
      .catch(() => {});
  }

  return { status, recordPerfectClear };
}
