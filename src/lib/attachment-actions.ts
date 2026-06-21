"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteFile, thumbKey } from "@/lib/storage";
import { saveAttachmentFile } from "@/lib/attachment-save";

export async function uploadAttachments(
  entityType: string,
  entityId: string,
  revalidate: string,
  formData: FormData
): Promise<void> {
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  for (const file of files) {
    await saveAttachmentFile(entityType, entityId, file);
  }

  revalidatePath(revalidate);
}

export async function deleteAttachment(
  revalidate: string,
  formData: FormData
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) return;

  await deleteFile(att.storageKey);
  if (att.kind === "IMAGE") await deleteFile(thumbKey(att.storageKey));
  await prisma.attachment.delete({ where: { id } });

  revalidatePath(revalidate);
}

// Удалить все вложения сущности (при удалении родительской записи).
export async function deleteAttachmentsFor(
  entityType: string,
  entityId: string
): Promise<void> {
  const atts = await prisma.attachment.findMany({
    where: { entityType, entityId },
  });
  for (const att of atts) {
    await deleteFile(att.storageKey);
    if (att.kind === "IMAGE") await deleteFile(thumbKey(att.storageKey));
  }
  await prisma.attachment.deleteMany({ where: { entityType, entityId } });
}

// ── Обложка категории документов ──
// Хранится как вложение entityType="categoryCover", entityId = имя категории.

export async function setCategoryCover(
  category: string,
  formData: FormData
): Promise<void> {
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    // одна обложка на категорию — заменяем прежнюю
    await deleteAttachmentsFor("categoryCover", category);
    await saveAttachmentFile("categoryCover", category, file);
    revalidatePath("/documents");
    revalidatePath(`/documents/category/${encodeURIComponent(category)}`);
  }
  redirect(`/documents/category/${encodeURIComponent(category)}`);
}

// Точка фокуса обложки (0..1) — куда центрировать кадр (по лицу).
export async function setAttachmentFocus(
  id: string,
  x: number,
  y: number
): Promise<void> {
  if (!id) return;
  const fx = Math.max(0, Math.min(1, x));
  const fy = Math.max(0, Math.min(1, y));
  const att = await prisma.attachment.update({
    where: { id },
    data: { focalX: fx, focalY: fy },
  });
  revalidatePath("/documents");
  if (att.entityType === "categoryCover") {
    revalidatePath(`/documents/category/${encodeURIComponent(att.entityId)}`);
  }
}

export async function removeCategoryCover(
  category: string,
  _formData: FormData
): Promise<void> {
  await deleteAttachmentsFor("categoryCover", category);
  revalidatePath("/documents");
  revalidatePath(`/documents/category/${encodeURIComponent(category)}`);
  redirect(`/documents/category/${encodeURIComponent(category)}`);
}
