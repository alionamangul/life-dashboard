"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadAttachments, deleteAttachment } from "@/lib/attachment-actions";
import { ConfirmSubmit } from "@/components/confirm-submit";

export type AttachmentView = {
  id: string;
  kind: "IMAGE" | "PDF";
  fileName: string;
};

export function Attachments({
  entityType,
  entityId,
  revalidate,
  items,
  label = "Фото и документы",
}: {
  entityType: string;
  entityId: string;
  revalidate: string;
  items: AttachmentView[];
  label?: string;
}) {
  const upload = uploadAttachments.bind(null, entityType, entityId, revalidate);
  const del = deleteAttachment.bind(null, revalidate);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<AttachmentView | null>(null);
  const [sharing, setSharing] = useState(false);

  // Отправить сам файл (а не ссылку) через системное меню «Поделиться».
  // На iPhone даёт «Фото» в Telegram/Почту и т.д. Запасной путь — скачивание.
  async function sharePhoto(att: AttachmentView) {
    try {
      setSharing(true);
      const res = await fetch(`/api/files/${att.id}`);
      const blob = await res.blob();
      const file = new File([blob], att.fileName || "photo", {
        type: blob.type || "application/octet-stream",
      });
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
        share?: (d: { files: File[]; title?: string }) => Promise<void>;
      };
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: att.fileName });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = att.fileName || "photo";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // отмена пользователем или ошибка — игнорируем
    } finally {
      setSharing(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          {label} {items.length > 0 ? `· ${items.length}` : ""}
        </span>
        <form ref={formRef} action={upload}>
          <input
            ref={inputRef}
            type="file"
            name="files"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={() => formRef.current?.requestSubmit()}
          />
          <AddButton onPick={() => inputRef.current?.click()} />
        </form>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
          Нет вложений. Нажмите «Добавить», чтобы загрузить фото или PDF.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((a) => (
            <div
              key={a.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
            >
              {a.kind === "IMAGE" ? (
                <button
                  type="button"
                  onClick={() => setPreview(a)}
                  className="h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/files/${a.id}?thumb=1`}
                    alt={a.fileName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ) : (
                <a
                  href={`/api/files/${a.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center"
                >
                  <span className="text-2xl">📄</span>
                  <span className="line-clamp-2 text-[10px] leading-tight text-slate-500">
                    {a.fileName}
                  </span>
                </a>
              )}

              <form action={del} className="absolute right-1 top-1">
                <input type="hidden" name="id" value={a.id} />
                <ConfirmSubmit
                  message="Удалить вложение?"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </ConfirmSubmit>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Просмотр в полном размере */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={() => setPreview(null)}
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (preview) sharePhoto(preview);
              }}
              disabled={sharing}
              className="mr-3 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {sharing ? "…" : "Поделиться"}
            </button>
            <a
              href={`/api/files/${preview.id}?download=1`}
              download
              onClick={(e) => e.stopPropagation()}
              className="mr-3 rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white"
            >
              Скачать
            </a>
            <button
              type="button"
              className="rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white"
            >
              Закрыть ✕
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/files/${preview.id}`}
              alt={preview.fileName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AddButton({ onPick }: { onPick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onPick}
      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Загрузка…" : "+ Добавить"}
    </button>
  );
}
