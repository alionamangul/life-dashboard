import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { expiryStatus } from "@/lib/medicine";
import { MedicineBrowser, type MedicineItem } from "./medicine-browser";

export const metadata: Metadata = { title: "Аптечка" };

export default async function MedicinePage() {
  const meds = await prisma.medicine.findMany({
    orderBy: [{ category: "asc" }, { expiryDate: "asc" }, { name: "asc" }],
  });

  const now = new Date();
  const items: MedicineItem[] = meds.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    expiry: m.expiryDate ? m.expiryDate.toISOString() : null,
    quantity: m.quantity,
    needToBuy: m.needToBuy,
  }));

  const expired = items.filter((i) => expiryStatus(i.expiry, now) === "expired").length;
  const soon = items.filter((i) => expiryStatus(i.expiry, now) === "soon").length;
  const buy = items.filter(
    (i) => i.needToBuy || expiryStatus(i.expiry, now) === "expired"
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💊</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Аптечка</h1>
            <p className="text-sm text-slate-500">{items.length} позиций</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/medicine/import"
            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
          >
            Импорт
          </Link>
          <Link
            href="/medicine/new"
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          >
            + Добавить
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">
            Аптечка пуста. Добавьте лекарство вручную или импортируйте список
            из Заметок.
          </p>
          <Link
            href="/medicine/import"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Импортировать список
          </Link>
        </div>
      ) : (
        <MedicineBrowser items={items} summary={{ expired, soon, buy }} />
      )}
    </div>
  );
}
