import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { readFile, thumbKey } from "@/lib/storage";

// Отдаёт файл вложения только авторизованному пользователю.
// ?thumb=1 — превью (для изображений), ?download=1 — как вложение для скачивания.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await ctx.params;
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const wantThumb = url.searchParams.get("thumb") === "1";
  const download = url.searchParams.get("download") === "1";

  // Превью для изображений
  if (wantThumb && att.kind === "IMAGE") {
    try {
      const thumb = await readFile(thumbKey(att.storageKey));
      return new Response(new Uint8Array(thumb), {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch {
      // превью нет — отдадим оригинал ниже
    }
  }

  let data: Buffer;
  try {
    data = await readFile(att.storageKey);
  } catch {
    return new Response("File missing", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": att.mimeType,
    "Cache-Control": "private, max-age=3600",
  };
  if (download) {
    const name = encodeURIComponent(att.fileName);
    headers["Content-Disposition"] = `attachment; filename*=UTF-8''${name}`;
  }

  return new Response(new Uint8Array(data), { headers });
}
