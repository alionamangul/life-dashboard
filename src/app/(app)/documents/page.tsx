import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDocThumbMap, UNCATEGORIZED } from "@/lib/document-thumbs";
import { NewCategoryButton } from "@/components/new-category-button";

export const metadata: Metadata = { title: "Документы" };

type Tile = {
  key: string;
  name: string;
  href: string;
  count: number;
  coverId: string | null;
};

export default async function DocumentsPage() {
  const [docs, thumbs, covers] = await Promise.all([
    prisma.document.findMany({ orderBy: { createdAt: "desc" } }),
    getDocThumbMap(),
    prisma.attachment.findMany({ where: { entityType: "categoryCover" } }),
  ]);

  // имя категории → id вложения-обложки
  const coverByCat = new Map(covers.map((c) => [c.entityId, c.id]));

  // группируем документы по категории (null → общий список)
  const byCat = new Map<string | null, typeof docs>();
  for (const d of docs) {
    const arr = byCat.get(d.category) ?? [];
    arr.push(d);
    byCat.set(d.category, arr);
  }

  const coverFor = (list: typeof docs): string | null => {
    for (const d of list) {
      const t = thumbs.get(d.id);
      if (t?.thumbId) return t.thumbId;
    }
    return null;
  };

  const tiles: Tile[] = [];

  // плашка «Без категории» (общий список) — первой, если есть
  const uncat = byCat.get(null);
  if (uncat?.length) {
    tiles.push({
      key: UNCATEGORIZED,
      name: "Без категории",
      href: `/documents/category/${UNCATEGORIZED}`,
      count: uncat.length,
      coverId: coverFor(uncat),
    });
  }

  // плашки реальных категорий (по алфавиту)
  const cats = [...byCat.keys()]
    .filter((c): c is string => c !== null)
    .sort((a, b) => a.localeCompare(b));
  for (const c of cats) {
    const list = byCat.get(c)!;
    tiles.push({
      key: c,
      name: c,
      href: `/documents/category/${encodeURIComponent(c)}`,
      count: list.length,
      coverId: coverByCat.get(c) ?? coverFor(list),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Документы</h1>
            <p className="text-sm text-slate-500">{docs.length} документов</p>
          </div>
        </div>
        <Link
          href="/documents/new"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
        >
          + Добавить
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 ring-1 ring-slate-200 active:scale-[.98]"
          >
            {t.coverId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/files/${t.coverId}?thumb=1`}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl text-slate-400">
                📄
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
              <div className="truncate text-sm font-semibold text-white">
                {t.name}
              </div>
              <div className="text-xs text-white/80">{t.count}</div>
            </div>
          </Link>
        ))}

        <NewCategoryButton />
      </div>

      {docs.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">
          Пока нет документов. Нажмите «+ Добавить».
        </p>
      )}
    </div>
  );
}
