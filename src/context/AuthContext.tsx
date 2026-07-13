"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "quiz-portal-auth";

export interface AuthCredentials {
  username: string;
  password: string;
}

interface AuthContextValue {
  auth: AuthCredentials | null;
  // localStorageからの復元が終わるまでfalse(ログインフォームの一瞬の誤表示を防ぐ)
  ready: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthCredentials | null>(null);
  const [ready, setReady] = useState(false);

  // localStorageからの一度きりのハイドレーション。SSRとの不一致を避けるため
  // 初期レンダー後のeffectで読む必要がある(このパターンに限りsync setStateを許容)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthCredentials;
        if (parsed?.username && parsed?.password) setAuth(parsed);
      }
    } catch {
      // 壊れたデータは無視(未ログイン扱い)
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function login(username: string, password: string) {
    const credentials = { username, password };
    setAuth(credentials);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
    } catch {
      // localStorageが使えなくてもセッション中はログイン状態を保つ
    }
  }

  function logout() {
    setAuth(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 無視
    }
  }

  return (
    <AuthContext.Provider value={{ auth, ready, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
