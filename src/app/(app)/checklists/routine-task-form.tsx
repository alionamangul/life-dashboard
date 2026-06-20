"use client";

import { useActionState } from "react";
import Link from "next/link";
import { WEEKDAY_SHORT } from "@/lib/routine";
import type { RoutineFormState } from "./actions";

type Action = (
  prev: RoutineFormState,
  fd: FormData
) => Promise<RoutineFormState>;

export type TaskInitial = {
  id?: string;
  category?: string;
  timeOfDay?: string; // DAY | EVENING
  label?: string;
  detail?: string | null;
  days?: string; // "135"
};

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export function RoutineTaskForm({
  action,
  initial = {},
  categories,
  submitLabel,
}: {
  action: Action;
  initial?: TaskInitial;
  categories: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<RoutineFormState, FormData>(
    action,
    {}
  );
  const days = initial.days ?? "1234567";
  const isEvening = initial.timeOfDay === "EVENING";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">
          Название <span className="text-red-500">*</span>
        </span>
        <input
          name="label"
          defaultValue={initial.label ?? ""}
          required
          autoFocus={!initial.id}
          className={inputCls}
          placeholder="Сухая щётка 3–5 мин"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Подсказка</span>
        <textarea
          name="detail"
          defaultValue={initial.detail ?? ""}
          rows={2}
          className={inputCls}
          placeholder="Что именно делать"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Категория</span>
        <input
          name="category"
          defaultValue={initial.category ?? ""}
          list="routine-categories"
          className={inputCls}
          placeholder="Уход за лицом"
        />
        <datalist id="routine-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Время дня</span>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <input
              type="radio"
              name="timeOfDay"
              value="DAY"
              defaultChecked={!isEvening}
              className="peer sr-only"
            />
            <span className="block rounded-xl border border-slate-300 py-2.5 text-center text-base peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white">
              ☀️ День
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="timeOfDay"
              value="EVENING"
              defaultChecked={isEvening}
              className="peer sr-only"
            />
            <span className="block rounded-xl border border-slate-300 py-2.5 text-center text-base peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white">
              🌙 Вечер
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Дни недели</span>
        <div className="flex gap-1.5">
          {WEEKDAY_SHORT.map((w, i) => (
            <label key={i} className="flex-1">
              <input
                type="checkbox"
                name="day"
                value={i + 1}
                defaultChecked={days.includes(String(i + 1))}
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-slate-300 py-2 text-center text-sm font-medium text-slate-600 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white">
                {w}
              </span>
            </label>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          Не выбрано ни одного дня = каждый день.
        </span>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3 pt-1">
        <Link
          href="/checklists/manage"
          className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-base font-medium text-slate-700"
        >
          Отмена
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Сохранение…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
