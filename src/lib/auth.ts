import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  sessionMaxAgeSeconds,
} from "./session";

// Серверные хелперы авторизации: проверка пароля и управление cookie-сессией.
// Импортирует bcryptjs (node), поэтому используется только в server actions /
// route handlers / серверных компонентах — НЕ в proxy.ts.

export async function verifyPassword(password: string): Promise<boolean> {
  const b64 = process.env.APP_PASSWORD_HASH;
  if (!b64) {
    throw new Error("APP_PASSWORD_HASH не задан в окружении");
  }
  const hash = Buffer.from(b64, "base64").toString("utf8");
  return bcrypt.compare(password, hash);
}

export async function createSession(): Promise<void> {
  const token = await signSession();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds(),
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return (await verifySession(token)) !== null;
}
