import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Глобальная защита: всё, что не /login и не публичные ассеты, требует сессии.
// (В Next.js 16 middleware переименован в proxy; runtime — nodejs.)

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = (await verifySession(token)) !== null;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Уже вошёл и идёт на /login → отправляем на дашборд.
  if (authed && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Не вошёл и идёт на защищённую страницу → на /login.
  if (!authed && !isPublic) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Пропускаем без проверки: внутренние ассеты Next, PWA-файлы и картинки.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|sw.js|icons/|robots.txt|.*\\.(?:png|jpg|jpeg|svg|webp|ico|gif)$).*)",
  ],
};
