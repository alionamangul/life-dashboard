"use client";

import { useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  setCategoryCover,
  removeCategoryCover,
  setAttachmentFocus,
} from "@/lib/attachment-actions";

export function CoverControl({
  category,
  coverId,
  focalX,
  focalY,
}: {
  category: string;
  coverId: string | null;
  focalX: number | null;
  focalY: number | null;
}) {
  const setCover = setCategoryCover.bind(null, category);
  const removeCover = removeCategoryCover.bind(null, category);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // точка фокуса (по умолчанию — верхняя треть, где обычно лицо)
  const [focus, setFocus] = useState({
    x: focalX ?? 0.5,
    y: focalY ?? 0.3,
  });
  const [, start] = useTransition();

  const handleTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!coverId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setFocus({ x, y });
    start(() => {
      setAttachmentFocus(coverId, x, y);
    });
  };

  return (
    <div className="mb-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">Обложка категории</span>
        <div className="flex items-center gap-1">
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
      </div>

      {coverId ? (
        <>
          <button
            type="button"
            onClick={handleTap}
            className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/files/${coverId}?thumb=1`}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }}
            />
            <span
              className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ring-2 ring-black/30"
              style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }}
            />
          </button>
          <p className="mt-1.5 text-center text-xs text-slate-400">
            Нажмите на лицо — кадр обложки центрируется по этой точке.
          </p>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-lg text-slate-300">
            🖼️
          </div>
          <span className="text-sm text-slate-400">
            Обложка не задана — нажмите «Поставить».
          </span>
        </div>
      )}
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
