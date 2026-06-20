"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { setCategoryCover, removeCategoryCover } from "@/lib/attachment-actions";

export function CoverControl({
  category,
  coverId,
}: {
  category: string;
  coverId: string | null;
}) {
  const setCover = setCategoryCover.bind(null, category);
  const removeCover = removeCategoryCover.bind(null, category);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {coverId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/files/${coverId}?thumb=1`}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg text-slate-300">
            🖼️
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 text-sm text-slate-600">
        {coverId ? "Обложка категории" : "Обложка не задана"}
      </div>

      <form ref={formRef} action={setCover}>
        <input
          ref={inputRef}
          type="file"
          name="cover"
          accept="image/*"
          className="hidden"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <CoverButton
          onPick={() => inputRef.current?.click()}
          label={coverId ? "Изменить" : "Поставить"}
        />
      </form>

      {coverId ? (
        <form action={removeCover}>
          <button
            type="submit"
            className="rounded-lg px-2 py-1.5 text-sm text-slate-400 active:text-red-500"
          >
            Убрать
          </button>
        </form>
      ) : null}
    </div>
  );
}

function CoverButton({ onPick, label }: { onPick: () => void; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onPick}
      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-60"
    >
      {pending ? "…" : label}
    </button>
  );
}
