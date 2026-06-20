"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { DocFormState } from "./actions";

type Action = (prev: DocFormState, fd: FormData) => Promise<DocFormState>;

export type DocInitial = {
  id?: string;
  title?: string;
  category?: string | null;
  personId?: string | null;
  notes?: string | null;
};

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const DEFAULT_CATEGORIES = [
  "Паспорт",
  "Свидетельство о рождении",
  "Страховка",
  "Медкарта",
  "Финансы",
  "Договоры",
  "Прочее",
];

export function DocumentForm({
  action,
  initial = {},
  people,
  categories,
  submitLabel,
}: {
  action: Action;
  initial?: DocInitial;
  people: { id: string; name: string }[];
  categories: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<DocFormState, FormData>(
    action,
    {}
  );

  const catList = [...new Set([...categories, ...DEFAULT_CATEGORIES])];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">
          Название <span className="text-red-500">*</span>
        </span>
        <input
          name="title"
          defaultValue={initial.title ?? ""}
          required
          autoFocus={!initial.id}
          className={inputCls}
          placeholder="Паспорт Давида"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Категория</span>
        <input
          name="category"
          defaultValue={initial.category ?? ""}
          list="doc-categories"
          className={inputCls}
          placeholder="Паспорт"
        />
        <datalist id="doc-categories">
          {catList.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Кого касается</span>
        <select
          name="personId"
          defaultValue={initial.personId ?? ""}
          className={inputCls}
        >
          <option value="">— не указано</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Заметки</span>
        <textarea
          name="notes"
          defaultValue={initial.notes ?? ""}
          rows={2}
          className={inputCls}
        />
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3 pt-1">
        <Link
          href="/documents"
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
