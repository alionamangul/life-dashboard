"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addShoppingItem,
  toggleShoppingBought,
  deleteShoppingItem,
  clearBought,
} from "./actions";

export type ShopItem = {
  id: string;
  name: string;
  quantity: string | null;
  personId: string | null;
  bought: boolean;
};

export function ShoppingListView({
  kind,
  items,
  people,
}: {
  kind: string; // HOME | SELF | KIDS
  items: ShopItem[];
  people: { id: string; name: string }[];
}) {
  const add = addShoppingItem.bind(null, kind);
  const clear = clearBought.bind(null, kind);

  // оптимистичное «куплено»
  const [boughtSet, setBoughtSet] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.bought).map((i) => i.id))
  );
  const [, start] = useTransition();

  const isBought = (id: string) => boughtSet.has(id);
  const toggle = (id: string) => {
    setBoughtSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    start(() => toggleShoppingBought(id));
  };

  const personName = useMemo(
    () => new Map(people.map((p) => [p.id, p.name])),
    [people]
  );

  const toBuy = items.filter((i) => !isBought(i.id));
  const bought = items.filter((i) => isBought(i.id));

  // для «Детям» — группировка списка покупок по ребёнку
  const groups = useMemo(() => {
    if (kind !== "KIDS") return [{ key: "", title: "", list: toBuy }];
    const map = new Map<string, ShopItem[]>();
    for (const it of toBuy) {
      const k = it.personId ?? "";
      const arr = map.get(k) ?? [];
      arr.push(it);
      map.set(k, arr);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] === "" ? 1 : 0) - (b[0] === "" ? 1 : 0))
      .map(([k, list]) => ({
        key: k,
        title: k ? (personName.get(k) ?? "") : "Без ребёнка",
        list,
      }));
  }, [kind, toBuy, personName]);

  return (
    <div className="mt-4">
      {/* Быстрое добавление */}
      <form action={add} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <div className="flex gap-2">
          <input
            name="name"
            required
            placeholder="Добавить…"
            autoComplete="off"
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
        {kind === "KIDS" && people.length > 0 && (
          <select
            name="personId"
            defaultValue=""
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Кому (необязательно)</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </form>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">
          Список пуст. Добавьте первый пункт.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Нужно купить */}
          {toBuy.length > 0 &&
            groups.map((g) => (
              <section key={g.key || "all"}>
                {g.title ? (
                  <h2 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {g.title} · {g.list.length}
                  </h2>
                ) : null}
                <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                  {g.list.map((it) => (
                    <Row
                      key={it.id}
                      it={it}
                      bought={false}
                      onToggle={() => toggle(it.id)}
                    />
                  ))}
                </ul>
              </section>
            ))}

          {/* Куплено */}
          {bought.length > 0 && (
            <section>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Куплено · {bought.length}
                </h2>
                <form action={clear}>
                  <button
                    type="submit"
                    className="text-xs font-medium text-slate-400 active:text-red-500"
                  >
                    Очистить купленные
                  </button>
                </form>
              </div>
              <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                {bought.map((it) => (
                  <Row
                    key={it.id}
                    it={it}
                    bought
                    onToggle={() => toggle(it.id)}
                    personLabel={
                      kind === "KIDS" && it.personId
                        ? personName.get(it.personId)
                        : undefined
                    }
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  it,
  bought,
  onToggle,
  personLabel,
}: {
  it: ShopItem;
  bought: boolean;
  onToggle: () => void;
  personLabel?: string;
}) {
  return (
    <li className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
          bought
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 text-transparent"
        }`}
      >
        ✓
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="min-w-0 flex-1 text-left"
      >
        <span
          className={`font-medium ${
            bought ? "text-slate-400 line-through" : "text-slate-900"
          }`}
        >
          {it.name}
        </span>
        {it.quantity ? (
          <span className="ml-2 text-xs text-slate-400">{it.quantity}</span>
        ) : null}
        {personLabel ? (
          <span className="ml-2 text-xs text-slate-400">· {personLabel}</span>
        ) : null}
      </button>
      <form action={deleteShoppingItem}>
        <input type="hidden" name="id" value={it.id} />
        <button
          type="submit"
          aria-label="Удалить"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 active:bg-slate-100 active:text-red-500"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </form>
    </li>
  );
}
