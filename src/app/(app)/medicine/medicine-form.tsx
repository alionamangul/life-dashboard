"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { MedicineFormState } from "./actions";

type Action = (
  prev: MedicineFormState,
  formData: FormData
) => Promise<MedicineFormState>;

export type MedicineInitial = {
  id?: string;
  name?: string;
  category?: string | null;
  expiry?: string; // "YYYY-MM"
  quantity?: string | null;
  purpose?: string | null;
  notes?: string | null;
  needToBuy?: boolean;
};

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export function MedicineForm({
  action,
  initial = {},
  categories,
  submitLabel,
}: {
  action: Action;
  initial?: MedicineInitial;
  categories: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<MedicineFormState, FormData>(
    action,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <Field label="Название" required>
        <input
          name="name"
          defaultValue={initial.name ?? ""}
          required
          autoFocus={!initial.id}
          className={inputCls}
          placeholder="Парацетамол детский"
        />
      </Field>

      <Field label="Категория">
        <input
          name="category"
          defaultValue={initial.category ?? ""}
          list="med-categories"
          className={inputCls}
          placeholder="Жаропонижающие и обезболивающие"
        />
        <datalist id="med-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Срок годности">
          <input
            type="month"
            name="expiry"
            defaultValue={initial.expiry ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Количество">
          <input
            name="quantity"
            defaultValue={initial.quantity ?? ""}
            className={inputCls}
            placeholder="1 уп"
          />
        </Field>
      </div>

      <Field label="Назначение">
        <input
          name="purpose"
          defaultValue={initial.purpose ?? ""}
          className={inputCls}
          placeholder="От температуры"
        />
      </Field>

      <Field label="Заметки">
        <textarea
          name="notes"
          defaultValue={initial.notes ?? ""}
          rows={2}
          className={inputCls}
        />
      </Field>

      <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
        <input
          type="checkbox"
          name="needToBuy"
          defaultChecked={initial.needToBuy ?? false}
          className="h-5 w-5 rounded border-slate-300 text-indigo-600"
        />
        <span className="text-sm text-slate-700">Нужно купить</span>
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3 pt-1">
        <Link
          href="/medicine"
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-600">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
