import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
import { verifyPassword } from "@/lib/auth";

const USERS_KEY = "math-quiz:users";

export async function authenticate(username: string, password: string): Promise<boolean> {
  const hash = await redis.hget<string>(USERS_KEY, username);
  if (!hash) return false;
  return verifyPassword(password, hash);
}

export function credentialsFromHeaders(
  request: NextRequest
): { username: string; password: string } | null {
  const username = request.headers.get("x-username");
  const password = request.headers.get("x-password");
  if (!username || !password) return null;
  try {
    return { username: decodeURIComponent(username), password: decodeURIComponent(password) };
  } catch {
    return null;
  }
}
