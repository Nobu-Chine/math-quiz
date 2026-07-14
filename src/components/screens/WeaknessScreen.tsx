"use client";

import { useEffect, useState } from "react";
import type { StatsData } from "@/lib/stats";
import { authHeaders } from "@/lib/auth-headers";

interface WeaknessScreenProps {
  username: string;
  password: string;
  onBack: () => void;
  statsApiPath?: string;
}

export default function WeaknessScreen({
  username,
  password,
  onBack,
  statsApiPath = "/api/stats",
}: WeaknessScreenProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(statsApiPath, { headers: authHeaders(username, password) })
      .then((res) => res.json())
      .then((data: StatsData) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username, password, statsApiPath]);

  const rows = stats
    ? Object.entries(stats)
        .filter(([, v]) => v.attempts > 0)
        .map(([category, v]) => ({
          category,
          accuracy: v.correct / v.attempts,
          attempts: v.attempts,
          correct: v.correct,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
    : [];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-700">📊 にがてぶんや</h2>

      {loading && <p className="text-slate-500">読み込み中…</p>}

      {!loading && rows.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-md">
          まだデータがありません
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.category} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{row.category}</span>
                <span className="text-slate-500">
                  {row.correct}/{row.attempts}問 正解(正解率{Math.round(row.accuracy * 100)}%)
                </span>
              </div>
              <div className="mt-2 h-3 w-full rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${
                    row.accuracy < 0.5
                      ? "bg-rose-400"
                      : row.accuracy < 0.8
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.round(row.accuracy * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-auto w-full rounded-2xl bg-white py-4 text-lg font-semibold text-violet-500 shadow-md transition-transform active:scale-95"
      >
        トップへもどる
      </button>
    </div>
  );
}
