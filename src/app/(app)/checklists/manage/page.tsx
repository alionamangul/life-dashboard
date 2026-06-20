import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sortCategories, CATEGORY_EMOJI, formatDays } from "@/lib/routine";

export const metadata: Metadata = { title: "Настроить рутину" };

export default async function ManageRoutinePage() {
  const tasks = await prisma.routineTask.findMany({ orderBy: { order: "asc" } });

  const groups = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const arr = groups.get(t.category) ?? [];
    arr.push(t);
    groups.set(t.category, arr);
  }
  const cats = sortCategories([...groups.keys()]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          href="/checklists"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 active:bg-slate-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-slate-900">Настроить рутину</h1>
          <p className="text-sm text-slate-500">{tasks.length} задач</p>
        </div>
        <Link
          href="/checklists/manage/new"
          className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
        >
          + Задача
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Пока нет задач. Нажмите «+ Задача».
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {cats.map((cat) => (
            <section key={cat}>
              <h2 className="mb-1.5 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>{CATEGORY_EMOJI[cat] ?? "•"}</span>
                <span>{cat}</span>
              </h2>
              <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                {groups.get(cat)!.map((t) => (
                  <li key={t.id} className="border-b border-slate-100 last:border-0">
                    <Link
                      href={`/checklists/manage/${t.id}`}
                      className="flex items-center gap-3 px-4 py-3 active:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">
                          {t.label}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-400">
                          {t.timeOfDay === "EVENING" ? "🌙 Вечер" : "☀️ День"} ·{" "}
                          {formatDays(t.days)}
                        </div>
                      </div>
                      <span className="text-slate-300">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
