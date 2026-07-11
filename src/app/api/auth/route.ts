import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const redis = Redis.fromEnv();
const USERS_KEY = "math-quiz:users";

export async function POST(request: NextRequest) {
  const allowed = await checkRateLimit(`ratelimit:auth:${clientIp(request)}`, 10, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。しばらくしてからお試しください" },
      { status: 429 }
    );
  }

  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json(
      { error: "ユーザー名とパスワードを入力してください" },
      { status: 400 }
    );
  }

  const name = username.trim();
  if (name.length === 0) {
    return NextResponse.json({ error: "ユーザー名を入力してください" }, { status: 400 });
  }

  const existingHash = await redis.hget<string>(USERS_KEY, name);

  if (!existingHash) {
    // 新規登録
    await redis.hset(USERS_KEY, { [name]: await hashPassword(password) });
    return NextResponse.json({ success: true, isNewUser: true });
  }

  if (!(await verifyPassword(password, existingHash))) {
    return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  }

  return NextResponse.json({ success: true, isNewUser: false });
}
