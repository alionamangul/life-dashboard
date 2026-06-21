import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KIND_BY_SLUG } from "./constants";
import { ShoppingListView, type ShopItem } from "./shopping-list";

export const metadata: Metadata = { title: "Покупки" };

const TABS = [
  { slug: "home", kind: "HOME", label: "Дом" },
  { slug: "self", kind: "SELF", label: "Себе" },
  { slug: "kids", kind: "KIDS", label: "Детям" },
];

export default async function ShoppingPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const sp = await searchParams;
  const slug = sp.list && KIND_BY_SLUG[sp.list] ? sp.list : "home";
  const kind = KIND_BY_SLUG[slug];

  const [lists, children] = await Promise.all([
    prisma.shoppingList.findMany({
      include: {
        items: {
          orderBy: [{ bought: "asc" }, { order: "asc" }, { createdAt: "asc" }],
        },
      },
    }),
    prisma.person.findMany({ where: { kind: "CHILD" }, orderBy: { order: "asc" } }),
  ]);

  const active = lists.find((l) => l.kind === kind);
  const items: ShopItem[] = (active?.items ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    personId: i.personId,
    bought: i.bought,
  }));

  // счётчики «нужно купить» для бейджей на табах
  const unboughtByKind = new Map<string, number>();
  for (const l of lists) {
    unboughtByKind.set(l.kind, l.items.filter((i) => !i.bought).length);
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">🛒</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Покупки</h1>
          <p className="text-sm text-slate-500">Списки для дома, себя и детей</p>
        </div>
      </div>

      {/* Табы */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1">
        {TABS.map((t) => {
          const isActive = t.slug === slug;
          const n = unboughtByKind.get(t.kind) ?? 0;
          return (
            <Link
              key={t.slug}
              href={`/shopping?list=${t.slug}`}
              scroll={false}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold ${
                isActive ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
              }`}
            >
              {t.label}
              {n > 0 ? (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {n}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <ShoppingListView
        key={kind}
        kind={kind}
        items={items}
        people={children.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
