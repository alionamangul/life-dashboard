"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/lib/sections";
import { logout } from "@/lib/auth-actions";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", title: "Дашборд", emoji: "🏠" },
    ...SECTIONS.map((s) => ({ href: s.href, title: s.title, emoji: s.emoji })),
    { href: "/search", title: "Поиск", emoji: "🔍" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Меню"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 active:bg-slate-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="text-lg">🏠</span>
            <span>Центр жизни</span>
          </Link>

          <Link
            href="/search"
            aria-label="Поиск"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 active:bg-slate-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Выезжающее меню */}
      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-xl pt-[env(safe-area-inset-top)]">
            <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
              <span className="font-semibold">Разделы</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 active:bg-slate-100"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {navItems.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-[15px] ${
                      active
                        ? "bg-indigo-50 font-medium text-indigo-700"
                        : "text-slate-700 active:bg-slate-100"
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    {item.title}
                  </Link>
                );
              })}
            </div>

            <form action={logout} className="border-t border-slate-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[15px] text-slate-600 active:bg-slate-100">
                <span className="text-xl">🚪</span>
                Выйти
              </button>
            </form>
          </nav>
        </div>
      )}
    </>
  );
}
