"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Создание новой категории-плашки: вводите название → открывается её страница,
// где можно добавить документы из общего списка.
export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 active:bg-slate-50"
      >
        <span className="text-2xl">＋</span>
        <span className="text-sm font-medium">Категория</span>
      </button>
    );
  }

  const go = () => {
    const n = name.trim();
    if (n) router.push(`/documents/category/${encodeURIComponent(n)}`);
  };

  return (
    <div className="flex aspect-[4/3] w-full flex-col justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Название"
        className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-indigo-500"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-600"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={go}
          className="flex-1 rounded-lg bg-indigo-600 px-2 py-1.5 text-xs font-semibold text-white"
        >
          Создать
        </button>
      </div>
    </div>
  );
}
