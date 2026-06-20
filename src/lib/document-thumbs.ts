import "server-only";
import { prisma } from "@/lib/prisma";

export type DocThumb = { count: number; thumbId: string | null };

// Карта documentId → { число вложений, id первого изображения для превью }
export async function getDocThumbMap(): Promise<Map<string, DocThumb>> {
  const atts = await prisma.attachment.findMany({
    where: { entityType: "document" },
    orderBy: { createdAt: "asc" },
  });
  const map = new Map<string, DocThumb>();
  for (const a of atts) {
    const cur = map.get(a.entityId) ?? { count: 0, thumbId: null };
    cur.count += 1;
    if (!cur.thumbId && a.kind === "IMAGE") cur.thumbId = a.id;
    map.set(a.entityId, cur);
  }
  return map;
}

export const UNCATEGORIZED = "__none__";
