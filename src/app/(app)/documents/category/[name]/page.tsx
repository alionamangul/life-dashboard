import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDocThumbMap, UNCATEGORIZED } from "@/lib/document-thumbs";
import { CoverControl } from "./cover-control";

export const metadata: Metadata = { title: "Категория" };

export default async function CategoryPage({
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
  const isUncategorized = name === UNCATEGORIZED;
  const title = isUncategorized ? "Без категории" : name;

  const [docs, thumbs, cover] = await Promise.all([
    prisma.document.findMany({
      where: isUncategorized ? { category: null } : { category: name },
      orderBy: { createdAt: "desc" },
    }),
    getDocThumbMap(),
    isUncategorized
      ? Promise.resolve(null)
      : prisma.attachment.findFirst({
          where: { entityType: "categoryCover", entityId: name },
        }),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/documents"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 active:bg-slate-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{docs.length} документов</p>
        </div>
        {!isUncategorized && (
          <Link
            href={`/documents/category/${encodeURIComponent(name)}/add`}
            className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            + Добавить
          </Link>
        )}
      </div>

      {!isUncategorized && (
        <CoverControl category={name} coverId={cover?.id ?? null} />
      )}

      {docs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {isUncategorized
            ? "Здесь пусто."
            : "В этой категории пока нет документов. Нажмите «+ Добавить», чтобы выбрать их из общего списка."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {docs.map((d) => {
            const t = thumbs.get(d.id);
            return (
              <Link
                key={d.id}
                href={`/documents/${d.id}`}
                className="block aspect-[3/4] overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 active:scale-[.98]"
              >
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
