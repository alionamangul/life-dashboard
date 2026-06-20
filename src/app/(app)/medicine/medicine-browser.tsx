"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  expiryStatus,
  formatExpiry,
  EXPIRY_BADGE,
  type ExpiryStatus,
} from "@/lib/medicine";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { quickAddBuy, markBought, removeMedicine } from "./actions";

export type MedicineItem = {
  id: string;
  name: string;
  category: string | null;
  expiry: string | null; // ISO
  quantity: string | null;
  needToBuy: boolean;
};

type Filter = "all" | "expired" | "soon" | "buy";

export function MedicineBrowser({
  items,
  summary,
}: {
  items: MedicineItem[];
  summary: { expired: number; soon: number; buy: number };
}) {
  const [query, setQuery] = useState("");
  const now = useMemo(() => new Date(), []);

  // Режим списка храним в URL (?view=…), чтобы он сохранялся при возврате
  // из карточки лекарства. Читаем после монтирования — иначе расходится
  // серверный и клиентский рендер (hydration mismatch).
  const [filter, setFilterState] = useState<Filter>("all");
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    if (v && ["expired", "soon", "buy"].includes(v)) setFilterState(v as Filter);
  }, []);

  const setFilter = (f: Filter) => {
    setFilterState(f);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (f === "all") url.searchParams.delete("view");
      else url.searchParams.set("view", f);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <div className="mt-4">
      {filter !== "buy" && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию и категории…"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          Все {items.length}
        </Chip>
        <Chip active={filter === "expired"} onClick={() => setFilter("expired")} tone="red">
          Просрочено {summary.expired}
        </Chip>
        <Chip active={filter === "soon"} onClick={() => setFilter("soon")} tone="amber">
          Скоро {summary.soon}
        </Chip>
        <Chip active={filter === "buy"} onClick={() => setFilter("buy")} tone="teal">
          🛒 Нужно купить {summary.buy}
        </Chip>
      </div>

      {filter === "buy" ? (
        <BuyView items={items} now={now} />
      ) : (
        <InventoryView items={items} query={query} filter={filter} now={now} />
      )}
    </div>
  );
}

// ── Список «Нужно купить»: форма быстрого добавления + просроченные ──
function BuyView({ items, now }: { items: MedicineItem[]; now: Date }) {
  const manual = items.filter((i) => i.needToBuy);
  const expiredOnly = items
    .filter((i) => !i.needToBuy && expiryStatus(i.expiry, now) === "expired")
    .sort((a, b) => (a.expiry ?? "").localeCompare(b.expiry ?? ""));

  return (
    <div className="mt-4 space-y-5">
      <form action={quickAddBuy} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <div className="flex gap-2">
          <input
            name="name"
            required
            placeholder="Что купить…"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <input
            name="quantity"
            placeholder="Кол-во"
            className="w-20 rounded-xl border border-slate-300 px-2.5 py-2.5 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white"
          >
            +
          </button>
        </div>
      </form>

      {manual.length === 0 && expiredOnly.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-400">
          Список покупок пуст. Просроченные лекарства появятся здесь
          автоматически.
        </p>
      )}

      {manual.length > 0 && (
        <section>
          <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            В списке покупок · {manual.length}
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            {manual.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-0"
              >
                <form action={markBought} className="flex">
                  <input type="hidden" name="id" value={it.id} />
                  <button
                    type="submit"
                    aria-label="Куплено"
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-300 text-transparent active:border-teal-500 active:bg-teal-500 active:text-white"
                  >
                    ✓
                  </button>
                </form>
                <Link href={`/medicine/${it.id}`} className="min-w-0 flex-1">
                  <span className="truncate font-medium text-slate-900">{it.name}</span>
                  {it.quantity ? (
                    <span className="ml-2 text-xs text-slate-400">{it.quantity}</span>
                  ) : null}
                </Link>
                <ExpiryBadge expiry={it.expiry} now={now} />
                <DeleteX id={it.id} name={it.name} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {expiredOnly.length > 0 && (
        <section>
          <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Просроченные — заменить · {expiredOnly.length}
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            {expiredOnly.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-2 border-b border-slate-100 px-3 py-3 last:border-0"
              >
                <Link
                  href={`/medicine/${it.id}`}
                  className="min-w-0 flex-1 truncate font-medium text-slate-900 active:opacity-60"
                >
                  {it.name}
                </Link>
                <ExpiryBadge expiry={it.expiry} now={now} />
                <DeleteX id={it.id} name={it.name} />
              </li>
            ))}
          </ul>
          <p className="mt-1.5 px-1 text-xs text-slate-400">
            После покупки откройте лекарство и обновите срок годности — оно
            исчезнет из списка.
          </p>
        </section>
      )}
    </div>
  );
}

// ── Обычный список аптечки (Все / Просрочено / Скоро) ──
function InventoryView({
  items,
  query,
  filter,
  now,
}: {
  items: MedicineItem[];
  query: string;
  filter: Filter;
  now: Date;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (q) {
        const hay = `${it.name} ${it.category ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const status = expiryStatus(it.expiry, now);
      if (filter === "expired") return status === "expired";
      if (filter === "soon") return status === "soon";
      return true;
    });
  }, [items, query, filter, now]);

  const groups = useMemo(() => {
    const map = new Map<string, MedicineItem[]>();
    for (const it of filtered) {
      const key = it.category ?? "Без категории";
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  if (filtered.length === 0) {
    return <p className="mt-8 text-center text-sm text-slate-400">Ничего не найдено</p>;
  }

  return (
    <div className="mt-4 space-y-5">
      {groups.map(([category, list]) => (
        <section key={category}>
          <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {category} · {list.length}
          </h2>
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            {list.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-2 border-b border-slate-100 px-3 py-3 last:border-0"
              >
                <Link href={`/medicine/${it.id}`} className="min-w-0 flex-1 active:opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-slate-900">{it.name}</span>
                    {it.needToBuy ? (
                      <span className="shrink-0 rounded-md bg-teal-100 px-1.5 py-0.5 text-[11px] font-medium text-teal-700">
                        купить
                      </span>
                    ) : null}
                  </div>
                  {it.quantity ? (
                    <div className="mt-0.5 truncate text-xs text-slate-400">{it.quantity}</div>
                  ) : null}
                </Link>
                <ExpiryBadge expiry={it.expiry} now={now} />
                <DeleteX id={it.id} name={it.name} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// Маленький серый крестик удаления — убирает лекарство отовсюду.
function DeleteX({ id, name }: { id: string; name: string }) {
  return (
    <form action={removeMedicine} className="flex">
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit
        message={`Удалить «${name}» из аптечки?`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 active:bg-slate-100 active:text-red-500"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </ConfirmSubmit>
    </form>
  );
}

function ExpiryBadge({ expiry, now }: { expiry: string | null; now: Date }) {
  const status: ExpiryStatus = expiryStatus(expiry, now);
  if (status === "none") return null;
  return (
    <span
      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium tabular-nums ${EXPIRY_BADGE[status]}`}
    >
      {formatExpiry(expiry)}
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
  tone = "slate",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "slate" | "red" | "amber" | "teal";
}) {
  const activeCls =
    tone === "red"
      ? "bg-red-600 text-white"
      : tone === "amber"
        ? "bg-amber-500 text-white"
        : tone === "teal"
          ? "bg-teal-600 text-white"
          : "bg-indigo-600 text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium ${
        active ? activeCls : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
