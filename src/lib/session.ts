import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// Работа с сессионным JWT. Только jose — без node-зависимостей,
// чтобы этот модуль можно было импортировать в proxy.ts.

export const SESSION_COOKIE = "lc_session";

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET не задан в окружении");
  }
  return new TextEncoder().encode(secret);
}

function ttlDays(): number {
  const n = Number(process.env.SESSION_TTL_DAYS ?? "30");
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export function sessionMaxAgeSeconds(): number {
  return ttlDays() * 24 * 60 * 60;
}

export async function signSession(): Promise<string> {
  return new SignJWT({ role: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlDays()}d`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<JWTPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}
