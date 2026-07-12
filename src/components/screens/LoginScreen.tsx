"use client";

import { useState } from "react";

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = username.trim();
    if (!name || !password) {
      setError("ユーザー名とパスワードを入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ログインに失敗しました");
        return;
      }
      onLogin(name, password);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
      <div>
        <p className="text-sm font-semibold tracking-wide text-violet-500">6年生</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-700">算数ふくしゅうクイズ</h1>
        <p className="mt-3 text-slate-500">ユーザー名でログイン(初回は自動登録)</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ユーザー名"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-700 shadow-sm outline-none focus:border-violet-400"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          autoComplete="new-password"
          data-1p-ignore
          data-lpignore="true"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-700 shadow-sm outline-none focus:border-violet-400"
        />
        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-violet-500 py-5 text-xl font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "ログイン中…" : "ログイン / とうろく"}
        </button>
      </form>
    </div>
  );
}
