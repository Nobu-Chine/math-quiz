"use client";

import { useEffect, useState } from "react";
import { CATEGORIES as MATH_CATEGORIES } from "@/lib/questionBank";
import { authHeaders } from "@/lib/auth-headers";

interface CategorySelectScreenProps {
  username: string;
  password: string;
  onSelectCategory: (category: string) => void;
  onStartGraduation: () => void;
  onBack: () => void;
  categories?: readonly string[];
  progressApiPath?: string;
  graduationQuestionCount?: number;
  passRatePercent?: number;
}

interface Progress {
  clears: string[];
  graduatedAt: string | null;
  bestStreak: number;
}

export default function CategorySelectScreen({
  username,
  password,
  onSelectCategory,
  onStartGraduation,
  onBack,
  categories = MATH_CATEGORIES,
  progressApiPath = "/api/progress",
  graduationQuestionCount = 28,
  passRatePercent = 80,
}: CategorySelectScreenProps) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(progressApiPath, { headers: authHeaders(username, password) })
      .then((res) => res.json())
      .then((data: Progress) => {
        if (!cancelled) setProgress(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username, password, progressApiPath]);

  const clears = new Set(progress?.clears ?? []);
  const allCleared = clears.size >= categories.length;
  const remaining = categories.length - clears.size;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-700">🗂️ カテゴリ別に挑戦</h2>
      <p className="text-sm text-slate-500">
        1つのカテゴリで全問正解すると「クリア」だよ。全カテゴリクリアで卒業テストに挑戦できる!
      </p>

      {loading && <p className="text-slate-500">読み込み中…</p>}

      {!loading && (
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className="flex items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm transition-transform active:scale-95"
            >
              <span className="font-semibold text-slate-700">{category}</span>
              {clears.has(category) && (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600">
                  ✓ クリア
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {progress?.graduatedAt && (
            <p className="mb-2 text-center text-sm font-bold text-fuchsia-500">
              🎓 卒業済み({new Date(progress.graduatedAt).toLocaleDateString("ja-JP")})
            </p>
          )}
          <button
            onClick={onStartGraduation}
            disabled={!allCleared}
            className="w-full rounded-2xl bg-fuchsia-500 py-4 text-lg font-bold text-white shadow-lg shadow-fuchsia-200 transition-transform active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {allCleared ? "🎓 卒業テストに挑戦" : `卒業テストまで あと${remaining}カテゴリ`}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">
            全カテゴリから{graduationQuestionCount}問出題・{passRatePercent}%以上正解で卒業
          </p>
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
