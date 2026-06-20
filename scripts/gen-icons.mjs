// Генерирует иконки PWA/iOS из встроенного SVG.
// Запуск: node scripts/gen-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const iconsDir = join(pub, "icons");
mkdirSync(iconsDir, { recursive: true });

const BG = "#4f46e5";

// Домик: белый силуэт на индиго-фоне, с отступами под maskable safe-zone.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${BG}"/>
  <g fill="#ffffff">
    <path d="M256 150 L150 252 L176 252 L176 372 L336 372 L336 252 L362 252 Z"/>
  </g>
  <rect x="232" y="312" width="48" height="60" rx="6" fill="${BG}"/>
</svg>`;

// Сохраняем исходный SVG (используется как favicon/иконка).
writeFileSync(join(pub, "icon.svg"), svg);

const svgBuf = Buffer.from(svg);

async function png(size, outPath) {
  await sharp(svgBuf).resize(size, size).png().toFile(outPath);
  console.log("→", outPath.replace(root + "/", ""));
}

await png(192, join(iconsDir, "icon-192.png"));
await png(512, join(iconsDir, "icon-512.png"));
await png(512, join(iconsDir, "icon-maskable-512.png"));
await png(180, join(pub, "apple-touch-icon.png"));
await png(32, join(pub, "favicon-32.png"));

console.log("Иконки сгенерированы.");
