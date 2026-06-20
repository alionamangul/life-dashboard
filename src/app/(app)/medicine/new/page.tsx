import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createMedicine } from "../actions";
import { MedicineForm } from "../medicine-form";

export const metadata: Metadata = { title: "Новое лекарство" };

export default async function NewMedicinePage() {
  const cats = await prisma.medicine.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categories = cats.map((c) => c.category!).filter(Boolean);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-5 text-xl font-bold text-slate-900">Новое лекарство</h1>
      <MedicineForm
        action={createMedicine}
        categories={categories}
        submitLabel="Добавить"
      />
    </div>
  );
}
