import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { monthInputValue } from "@/lib/medicine";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { updateMedicine, deleteMedicine } from "../actions";
import { MedicineForm } from "../medicine-form";

export const metadata: Metadata = { title: "Лекарство" };

export default async function EditMedicinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [med, cats] = await Promise.all([
    prisma.medicine.findUnique({ where: { id } }),
    prisma.medicine.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  if (!med) notFound();

  const categories = cats.map((c) => c.category!).filter(Boolean);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-5 text-xl font-bold text-slate-900">Лекарство</h1>

      <MedicineForm
        action={updateMedicine}
        submitLabel="Сохранить"
        categories={categories}
        initial={{
          id: med.id,
          name: med.name,
          category: med.category,
          expiry: monthInputValue(med.expiryDate),
          quantity: med.quantity,
          purpose: med.purpose,
          notes: med.notes,
          needToBuy: med.needToBuy,
        }}
      />

      <form action={deleteMedicine} className="mt-6">
        <input type="hidden" name="id" value={med.id} />
        <ConfirmSubmit
          message={`Удалить «${med.name}» из аптечки?`}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 active:bg-red-100"
        >
          Удалить лекарство
        </ConfirmSubmit>
      </form>
    </div>
  );
}
