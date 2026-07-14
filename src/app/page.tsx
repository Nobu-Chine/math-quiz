"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  const { auth, ready } = useAuth();

  if (!ready) return null;

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-gradient-to-b from-sky-100 via-violet-100 to-rose-100 px-4 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-10 text-center">
        {!auth ? (
          <LoginForm />
        ) : (
          <>
            <div>
              <h1 className="mt-2 text-3xl font-bold text-slate-700">クイズポータル</h1>
              <p className="mt-3 text-slate-500">遊びたいクイズを選んでね</p>
            </div>
            <div className="flex w-full flex-col gap-4">
              <div>
                <Link
                  href="/math"
                  className="block w-full rounded-2xl bg-violet-500 py-6 text-xl font-bold text-white shadow-lg shadow-violet-200 transition-transform active:scale-95"
                >
                  算数クイズ
                </Link>
                <p className="mt-1 text-xs text-slate-400">6年生の算数を復習できるよ</p>
              </div>
              <Link
                href="/map"
                className="w-full rounded-2xl bg-sky-600 py-6 text-xl font-bold text-white shadow-lg shadow-sky-200 transition-transform active:scale-95"
              >
                沖縄マップクイズ
              </Link>
              <div>
                <Link
                  href="/science"
                  className="block w-full rounded-2xl bg-emerald-500 py-6 text-xl font-bold text-white shadow-lg shadow-emerald-200 transition-transform active:scale-95"
                >
                  理科クイズ
                </Link>
                <p className="mt-1 text-xs text-slate-400">中学1年生の理科を復習できるよ</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
