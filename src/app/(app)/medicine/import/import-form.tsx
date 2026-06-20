"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { parseMedicineList } from "@/lib/medicine-import";
import { expiryStatus } from "@/lib/medicine";
import { importMedicines, type ImportState } from "../actions";

export function MedicineImport() {
  const [text, setText] = useState("");
  const [state, formAction, pending] = useActionState<ImportState, FormData>(
    importMedicines,
    {}
  );

  const preview = useMemo(() => {
    const res = parseMedicineList(text);
    const now = new Date();
    const expired = res.items.filter(
      (i) => expiryStatus(i.expiryDate, now) === "expired"
    ).length;
    const cats = new Set(res.items.map((i) => i.category ?? "—"));
    return { ...res, expired, categories: cats.size };
  }, [text]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Вставьте список из Заметок. Формат строки: «Название 05/27».
        Заголовки-категории (например «1. Жаропонижающие») распознаются
        автоматически. Ссылки и пустые строки игнорируются.
      </p>

      <textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={"1. Жаропонижающие\n· Парацетамол детский 05/27\n· Нурофен 08/26"}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />

      {text.trim() && (
        <div className="rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="font-semibold text-slate-900">
              Распознано: {preview.items.length}
            </span>
            <span className="text-slate-500">
              категорий: {preview.categories}
            </span>
            {preview.expired > 0 && (
              <span className="text-red-600">просрочено: {preview.expired}</span>
            )}
            {preview.ignored > 0 && (
              <span className="text-slate-400">
                пропущено ссылок: {preview.ignored}
              </span>
            )}
          </div>

          {preview.unrecognized.length > 0 && (
            <div className="mt-2 text-xs text-amber-700">
              Не распознано {preview.unrecognized.length} строк (не будут
              импортированы): {preview.unrecognized.slice(0, 5).join(" · ")}
              {preview.unrecognized.length > 5 ? "…" : ""}
            </div>
          )}

          {preview.items.length > 0 && (
            <ul className="mt-3 max-h-48 space-y-0.5 overflow-y-auto text-xs text-slate-600">
              {preview.items.slice(0, 60).map((it, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span className="truncate">{it.name}</span>
                  <span className="shrink-0 tabular-nums text-slate-400">
                    {it.expiryRaw ?? "—"}
                  </span>
                </li>
              ))}
              {preview.items.length > 60 && (
                <li className="text-slate-400">…ещё {preview.items.length - 60}</li>
              )}
            </ul>
          )}
        </div>
      )}

      <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
        <input
          type="checkbox"
          name="replace"
          className="h-5 w-5 rounded border-slate-300 text-indigo-600"
        />
        <span className="text-sm text-slate-700">
          Сначала удалить все имеющиеся лекарства (замена списка)
        </span>
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Link
          href="/medicine"
          className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-base font-medium text-slate-700"
        >
          Отмена
        </Link>
        <button
          type="submit"
          disabled={pending || preview.items.length === 0}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
        >
          {pending
            ? "Импорт…"
            : `Импортировать${preview.items.length ? ` (${preview.items.length})` : ""}`}
        </button>
      </div>
    </form>
  );
}
