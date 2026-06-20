// Пакетная установка обложек категорий документов из папки.
// Имя файла (без расширения) = имя категории. Напр. «Алёна.jpg» → обложка
// категории «Алёна», «семья.png» → обложка «семья».
//
// Запуск:
//   node scripts/set-category-covers.mjs "/путь/к/папке-с-фото"
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
  ".heic": "image/heic",
  ".heif": "image/heif",
};
const thumbKey = (k) => k.replace(/\.[^.]+$/, "") + ".thumb.jpg";
const save = async (key, buf) => {
  await fs.mkdir(UPLOADS, { recursive: true });
  await fs.writeFile(path.join(UPLOADS, key), buf);
};

async function setCover(category, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return false;
  const buffer = await fs.readFile(filePath);

  // удалить прежнюю обложку категории (файлы + записи)
  const old = await prisma.attachment.findMany({
    where: { entityType: "categoryCover", entityId: category },
  });
  for (const a of old) {
    await fs.unlink(path.join(UPLOADS, a.storageKey)).catch(() => {});
    await fs.unlink(path.join(UPLOADS, thumbKey(a.storageKey))).catch(() => {});
  }
  await prisma.attachment.deleteMany({
    where: { entityType: "categoryCover", entityId: category },
  });

  const id = randomUUID();
  const key = `${id}${ext}`;
  let width, height;
  try {
    const meta = await sharp(buffer).metadata();
    width = meta.width;
    height = meta.height;
    const thumb = await sharp(buffer)
      .rotate()
      .resize(700, 700, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    await save(thumbKey(key), thumb);
  } catch {
    /* без превью */
  }
  await save(key, buffer);
  await prisma.attachment.create({
    data: {
      entityType: "categoryCover",
      entityId: category,
      fileName: path.basename(filePath),
      storageKey: key,
      mimeType: mime,
      kind: "IMAGE",
      size: buffer.length,
      width,
      height,
    },
  });
  return true;
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error('Использование: node scripts/set-category-covers.mjs "/путь/к/папке"');
    process.exit(1);
  }

  const cats = (
    await prisma.document.findMany({
      where: { NOT: { category: null } },
      select: { category: true },
      distinct: ["category"],
    })
  ).map((c) => c.category);
  const catByLower = new Map(cats.map((c) => [c.toLowerCase().trim(), c]));

  const entries = await fs.readdir(folder, { withFileTypes: true });
  let set = 0;
  const unmatched = [];

  for (const e of entries) {
    if (!e.isFile() || e.name.startsWith(".")) continue;
    const ext = path.extname(e.name).toLowerCase();
    if (!MIME[ext]) continue;
    const base = path.basename(e.name, path.extname(e.name)).toLowerCase().trim();
    const category = catByLower.get(base);
    if (!category) {
      unmatched.push(e.name);
      continue;
    }
    if (await setCover(category, path.join(folder, e.name))) {
      console.log(`🖼️  «${category}» ← ${e.name}`);
      set++;
    }
  }

  console.log(`\nГотово: установлено обложек ${set}.`);
  if (unmatched.length) {
    console.log(
      `Без совпадения с категориями (${unmatched.length}): ${unmatched.join(", ")}`
    );
    console.log(`Существующие категории: ${cats.join(", ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
