import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDocThumbMap } from "@/lib/document-thumbs";
import { assignToCategory } from "../../../actions";

export const metadata: Metadata = { title: "Добавить в категорию" };

export default async function AddToCategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: raw } = await params;
  let name = raw;
  try {
    name = decodeURIComponent(raw);
  } catch {
    /* оставляем как есть */
  }

  const [docs, thumbs] = await Promise.all([
    prisma.document.findMany({
      where: { category: null }, // общий список (без категории)
      orderBy: { createdAt: "desc" },
    }),
    getDocThumbMap(),
  ]);

  const backHref = `/documents/category/${encodeURIComponent(name)}`;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Link
          href={backHref}
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 active:bg-slate-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-slate-900">
            Добавить в «{name}»
          </h1>
          <p className="text-sm text-slate-500">
            Выберите документы из общего списка
          </p>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          В общем списке не осталось документов без категории.
        </div>
      ) : (
        <form action={assignToCategory.bind(null, name)}>
          <div className="grid grid-cols-2 gap-3 pb-24">
            {docs.map((d) => {
              const t = thumbs.get(d.id);
              return (
                <label key={d.id} className="relative block cursor-pointer">
                  <input
                    type="checkbox"
                    name="docIds"
                    value={d.id}
                    className="peer sr-only"
                  />
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 peer-checked:ring-4 peer-checked:ring-indigo-600">
                    {t?.thumbId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/files/${t.thumbId}?thumb=1`}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
                        📄
                      </div>
                    )}
                  </div>
                  <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-transparent ring-1 ring-slate-300 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:ring-indigo-600">
                    ✓
                  </span>
                </label>
              );
            })}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
            <div className="mx-auto flex max-w-3xl gap-3">
              <Link
                href={backHref}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-base font-medium text-slate-700"
              >
                Отмена
              </Link>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white"
              >
                Добавить выбранные
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
