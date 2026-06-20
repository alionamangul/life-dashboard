import "server-only";
import { promises as fs } from "fs";
import path from "path";

// Абстракция хранилища файлов. Сейчас — локальная файловая система.
// Чтобы переключиться на S3, достаточно заменить реализацию этих функций.

const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "var", "uploads");

// Ключ хранилища — только безопасные символы (защита от обхода путей).
function resolveKey(key: string): string {
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe) throw new Error("Пустой ключ файла");
  return path.join(UPLOADS_DIR, safe);
}

export async function saveFile(key: string, data: Buffer): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(resolveKey(key), data);
}

export async function readFile(key: string): Promise<Buffer> {
  return fs.readFile(resolveKey(key));
}

export async function deleteFile(key: string): Promise<void> {
  try {
    await fs.unlink(resolveKey(key));
  } catch {
    // файла нет — игнорируем
  }
}

// Ключ превью для изображения: <id>.thumb.jpg
export function thumbKey(storageKey: string): string {
  return storageKey.replace(/\.[^.]+$/, "") + ".thumb.jpg";
}

export function uploadsDir(): string {
  return UPLOADS_DIR;
}
