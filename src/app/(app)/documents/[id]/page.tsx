import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Attachments, type AttachmentView } from "@/components/attachments";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { updateDocument, deleteDocument } from "../actions";
import { DocumentForm } from "../document-form";

export const metadata: Metadata = { title: "Документ" };

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [doc, people, cats, atts] = await Promise.all([
    prisma.document.findUnique({ where: { id } }),
    prisma.person.findMany({ orderBy: { order: "asc" } }),
    prisma.document.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.attachment.findMany({
      where: { entityType: "document", entityId: id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!doc) notFound();

  const items: AttachmentView[] = atts.map((a) => ({
    id: a.id,
    kind: a.kind === "PDF" ? "PDF" : "IMAGE",
    fileName: a.fileName,
  }));

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-5 text-xl font-bold text-slate-900">Документ</h1>

      <div className="mb-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <Attachments
          entityType="document"
          entityId={doc.id}
          revalidate={`/documents/${doc.id}`}
          items={items}
          label="Сканы"
        />
      </div>

      <DocumentForm
        action={updateDocument}
        submitLabel="Сохранить"
        people={people.map((p) => ({ id: p.id, name: p.name }))}
        categories={cats.map((c) => c.category!).filter(Boolean)}
        initial={{
          id: doc.id,
          title: doc.title,
          category: doc.category,
          personId: doc.personId,
          notes: doc.notes,
        }}
      />

      <form action={deleteDocument} className="mt-6">
        <input type="hidden" name="id" value={doc.id} />
        <ConfirmSubmit
          message={`Удалить документ «${doc.title}» вместе со сканами?`}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 active:bg-red-100"
        >
          Удалить документ
        </ConfirmSubmit>
      </form>
    </div>
  );
}
