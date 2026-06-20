import "server-only";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { saveFile, thumbKey } from "@/lib/storage";

// Общая логика сохранения одного файла-вложения (используется и при загрузке
// вложений, и при установке обложки категории).

export const MAX_SIZE = 30 * 1024 * 1024; // 30 МБ

export const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

export async function saveAttachmentFile(
  entityType: string,
  entityId: string,
  file: File
): Promise<boolean> {
  if (file.size === 0 || file.size > MAX_SIZE) return false;
  const mime = file.type;
  const ext = EXT_BY_MIME[mime];
  if (!ext) return false;

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  const key = `${id}.${ext}`;
  const isImage = mime.startsWith("image/");
  let width: number | undefined;
  let height: number | undefined;

  if (isImage) {
    try {
      const meta = await sharp(buffer).metadata();
      width = meta.width;
      height = meta.height;
      const thumb = await sharp(buffer)
        .rotate()
        .resize(700, 700, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 78 })
        .toBuffer();
      await saveFile(thumbKey(key), thumb);
    } catch {
      // напр. HEIC без поддержки — без превью
    }
  }

  await saveFile(key, buffer);
  await prisma.attachment.create({
    data: {
      entityType,
      entityId,
      fileName: file.name || key,
      storageKey: key,
      mimeType: mime,
      kind: mime === "application/pdf" ? "PDF" : "IMAGE",
      size: file.size,
      width,
      height,
    },
  });
  return true;
}
