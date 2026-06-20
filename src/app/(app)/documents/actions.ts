"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteAttachmentsFor } from "@/lib/attachment-actions";

export type DocFormState = { error?: string };

function str(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v ? v : null;
}

function fields(fd: FormData) {
  return {
    title: String(fd.get("title") ?? "").trim(),
    category: str(fd, "category"),
    personId: str(fd, "personId"),
    notes: str(fd, "notes"),
  };
}

export async function createDocument(
  _prev: DocFormState,
  fd: FormData
): Promise<DocFormState> {
  const data = fields(fd);
  if (!data.title) return { error: "Укажите название" };
  const doc = await prisma.document.create({ data });
  revalidatePath("/documents");
  // Переходим в карточку, чтобы сразу добавить сканы.
  redirect(`/documents/${doc.id}`);
}

export async function updateDocument(
  _prev: DocFormState,
  fd: FormData
): Promise<DocFormState> {
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Не найден документ" };
  const data = fields(fd);
  if (!data.title) return { error: "Укажите название" };
  await prisma.document.update({ where: { id }, data });
  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  redirect("/documents");
}

export async function deleteDocument(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (id) {
    await deleteAttachmentsFor("document", id);
    await prisma.document.delete({ where: { id } });
    revalidatePath("/documents");
  }
  redirect("/documents");
}

// Назначить выбранным документам категорию (добавить в плашку из общего списка).
export async function assignToCategory(category: string, fd: FormData) {
  const ids = fd.getAll("docIds").map(String).filter(Boolean);
  if (ids.length) {
    await prisma.document.updateMany({
      where: { id: { in: ids } },
      data: { category },
    });
    revalidatePath("/documents");
  }
  redirect(`/documents/category/${encodeURIComponent(category)}`);
}

// Убрать документ из категории (вернуть в общий список).
export async function clearDocumentCategory(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const category = String(fd.get("category") ?? "");
  if (id) {
    await prisma.document.update({ where: { id }, data: { category: null } });
    revalidatePath("/documents");
  }
  redirect(category ? `/documents/category/${encodeURIComponent(category)}` : "/documents");
}
