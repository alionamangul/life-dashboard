import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  todayMoscow,
  weekDates,
  weekdayOf,
  dayMatches,
  sortCategories,
  CATEGORY_EMOJI,
  WEEKDAY_SHORT,
  WEEKDAY_FULL,
} from "@/lib/routine";
import { RoutineDay, type DayGroup } from "./routine-day";

export const metadata: Metadata = { title: "Чек-листы" };

export default async function ChecklistsPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const today = todayMoscow();
  const sp = await searchParams;
  const selected = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : today;

  const week = weekDates(selected);
  const weekStrs = week.map((w) => w.date);

  const [tasks, checks] = await Promise.all([
    prisma.routineTask.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.routineCheck.findMany({ where: { date: { in: weekStrs } } }),
  ]);

  // date -> Set(taskId) выполненных
  const checkedByDate = new Map<string, Set<string>>();
  for (const c of checks) {
    const s = checkedByDate.get(c.date) ?? new Set<string>();
    s.add(c.taskId);
    checkedByDate.set(c.date, s);
  }

  // прогресс по каждому дню недели (полоска под датой)
  const dayProgress = (date: string) => {
    const wd = weekdayOf(date);
    const applicable = tasks.filter((t) => dayMatches(t.days, wd));
    const set = checkedByDate.get(date);
    const done = set ? applicable.filter((t) => set.has(t.id)).length : 0;
    return { total: applicable.length, done };
  };

  // задачи выбранного дня → группы День/Вечер → категории
  const selWeekday = weekdayOf(selected);
  const dayTasks = tasks.filter((t) => dayMatches(t.days, selWeekday));
  const buildGroup = (time: "DAY" | "EVENING"): DayGroup => {
    const list = dayTasks.filter((t) => t.timeOfDay === time);
    const cats = sortCategories([...new Set(list.map((t) => t.category))]);
    return {
      time,
      categories: cats.map((name) => ({
        name,
        emoji: CATEGORY_EMOJI[name] ?? "•",
        tasks: list
          .filter((t) => t.category === name)
          .map((t) => ({ id: t.id, label: t.label, detail: t.detail })),
      })),
    };
  };
  const groups = [buildGroup("DAY"), buildGroup("EVENING")];
  const initialChecked = [...(checkedByDate.get(selected) ?? [])];

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Чек-листы</h1>
          <p className="text-sm text-slate-500">
            {WEEKDAY_FULL[selWeekday - 1]}
            {selected === today ? " · сегодня" : ""}
          </p>
        </div>
        <Link
          href="/checklists/manage"
          className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
        >
          Настроить
        </Link>
      </div>

      {/* Неделя */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {week.map((d) => {
          const isToday = d.date === today;
          const isSel = d.date === selected;
          const { total, done } = dayProgress(d.date);
          const full = total > 0 && done >= total;
          return (
            <Link
              key={d.date}
              href={`/checklists?d=${d.date}`}
              scroll={false}
              className={`flex flex-col items-center rounded-xl py-2 ${
                isSel
                  ? "bg-indigo-600 text-white"
                  : isToday
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              <span className="text-[11px] font-medium uppercase opacity-80">
                {WEEKDAY_SHORT[d.weekday - 1]}
              </span>
              <span className="text-lg font-bold leading-tight">{d.dayNum}</span>
              <span
                className={`mt-1 h-1.5 w-1.5 rounded-full ${
                  full
                    ? isSel
                      ? "bg-white"
                      : "bg-emerald-500"
                    : done > 0
                      ? isSel
                        ? "bg-white/60"
                        : "bg-amber-400"
                      : isSel
                        ? "bg-white/25"
                        : "bg-slate-200"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {tasks.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">
          Пока нет задач рутины.
        </p>
      ) : (
        <RoutineDay
          key={selected}
          date={selected}
          groups={groups}
          initialChecked={initialChecked}
        />
      )}
    </div>
  );
}
