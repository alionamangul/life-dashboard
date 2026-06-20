// Массовый импорт сканов в раздел «Документы» из локальной папки.
//
// Логика:
//   • каждая ПОДПАПКА → отдельный документ (все файлы внутри = его сканы),
//   • каждый отдельный ФАЙЛ в корне папки → отдельный документ.
//
// Запуск:
//   node scripts/import-documents.mjs "/путь/к/папке" ["Категория"]
//
// Категория необязательна (можно проставить позже в приложении).
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const UPLOADS = path.join(process.cwd(), "var", "uploads");

const MIME = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".pdf": "application/pdf",
};

const thumbKey = (k) => k.replace(/\.[^.]+$/, "") + ".thumb.jpg";
const save = async (key, buf) => {
  await fs.mkdir(UPLOADS, { recursive: true });
  await fs.writeFile(path.join(UPLOADS, key), buf);
};

// Рекурсивно собрать поддерживаемые файлы внутри папки (с сортировкой).
async function collectFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await collectFiles(full)));
    else if (MIME[path.extname(e.name).toLowerCase()]) out.push(full);
  }
  return out;
}

async function importFile(filePath, entityId) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return false;

  const buffer = await fs.readFile(filePath);
  const id = randomUUID();
  const key = `${id}${ext}`;
  const isImage = mime.startsWith("image/");
  let width, height;

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
      await save(thumbKey(key), thumb);
    } catch {
      // напр. HEIC без поддержки — превью не будет
    }
  }

  await save(key, buffer);
  await prisma.attachment.create({
    data: {
      entityType: "document",
      entityId,
      fileName: path.basename(filePath),
      storageKey: key,
      mimeType: mime,
      kind: mime === "application/pdf" ? "PDF" : "IMAGE",
      size: buffer.length,
      width,
      height,
    },
  });
  return true;
}

async function main() {
  const folder = process.argv[2];
  const category = process.argv[3] || null;
  if (!folder) {
    console.error('Использование: node scripts/import-documents.mjs "/путь/к/папке" ["Категория"]');
    process.exit(1);
  }

  const entries = await fs.readdir(folder, { withFileTypes: true });
  let docCount = 0;
  let fileCount = 0;

  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(folder, e.name);

    if (e.isDirectory()) {
      const files = await collectFiles(full);
      if (!files.length) continue;
      const doc = await prisma.document.create({
        data: category ? { title: e.name, category } : { title: e.name },
      });
      for (const f of files) if (await importFile(f, doc.id)) fileCount++;
      docCount++;
      console.log(`📁 ${e.name}: ${files.length} файл(ов)`);
    } else if (MIME[path.extname(e.name).toLowerCase()]) {
      const title = path.basename(e.name, path.extname(e.name));
      const doc = await prisma.document.create({
        data: category ? { title, category } : { title },
      });
      if (await importFile(full, doc.id)) fileCount++;
      docCount++;
      console.log(`📄 ${e.name}`);
    }
  }

  console.log(`\nГотово: документов ${docCount}, файлов ${fileCount}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
