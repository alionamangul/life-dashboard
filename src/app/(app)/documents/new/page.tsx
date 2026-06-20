import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { createDocument } from "../actions";
import { DocumentForm } from "../document-form";

export const metadata: Metadata = { title: "Новый документ" };

export default async function NewDocumentPage() {
  const [people, cats] = await Promise.all([
    prisma.person.findMany({ orderBy: { order: "asc" } }),
    prisma.document.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-5 text-xl font-bold text-slate-900">Новый документ</h1>
      <DocumentForm
        action={createDocument}
        submitLabel="Создать и добавить сканы"
        people={people.map((p) => ({ id: p.id, name: p.name }))}
        categories={cats.map((c) => c.category!).filter(Boolean)}
      />
    </div>
  );
}
