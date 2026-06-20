"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleRoutineCheck } from "./actions";

export type DayTask = { id: string; label: string; detail: string | null };
export type DayCategory = { name: string; emoji: string; tasks: DayTask[] };
export type DayGroup = { time: "DAY" | "EVENING"; categories: DayCategory[] };

export function RoutineDay({
  date,
  groups,
  initialChecked,
}: {
  date: string;
  groups: DayGroup[];
  initialChecked: string[];
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initialChecked));
  const [, start] = useTransition();

  const allTaskIds = useMemo(
    () => groups.flatMap((g) => g.categories.flatMap((c) => c.tasks.map((t) => t.id))),
    [groups]
  );
  const total = allTaskIds.length;
  const done = allTaskIds.filter((id) => checked.has(id)).length;

  const toggle = (taskId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
    start(() => {
      toggleRoutineCheck(taskId, date);
    });
  };

  return (
    <div className="mt-4">
      {/* Прогресс дня */}
      <div className="mb-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Сделано за день</span>
          <span className="tabular-nums text-slate-500">
            {done} из {total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {groups.map((g) => {
        const gTasks = g.categories.flatMap((c) => c.tasks);
        if (gTasks.length === 0) return null;
        const gDone = gTasks.filter((t) => checked.has(t.id)).length;
        return (
          <section key={g.time} className="mb-5">
            <h2 className="mb-2 flex items-center gap-2 px-1 text-base font-bold text-slate-800">
              <span>{g.time === "DAY" ? "☀️ День" : "🌙 Вечер"}</span>
              <span className="text-sm font-normal text-slate-400">
                {gDone}/{gTasks.length}
              </span>
            </h2>

            <div className="space-y-3">
              {g.categories.map((cat) => (
                <div
                  key={cat.name}
                  className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2 text-sm font-semibold text-slate-600">
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </div>
                  <ul>
                    {cat.tasks.map((t) => {
                      const isDone = checked.has(t.id);
                      return (
                        <li
                          key={t.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => toggle(t.id)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left active:bg-slate-50"
                          >
                            <span
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                                isDone
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-300 text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block font-medium ${
                                  isDone
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900"
                                }`}
                              >
                                {t.label}
                              </span>
                              {t.detail ? (
                                <span
                                  className={`mt-0.5 block text-xs ${
                                    isDone ? "text-slate-300" : "text-slate-400"
                                  }`}
                                >
                                  {t.detail}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
