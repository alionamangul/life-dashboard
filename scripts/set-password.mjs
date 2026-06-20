// Устанавливает пароль для входа: считает bcrypt-хеш, кодирует его в base64
// (чтобы символы `$` в хеше не ломались при загрузке .env через dotenv-expand)
// и записывает APP_PASSWORD_HASH в .env.
//
// Запуск:  node scripts/set-password.mjs "ваш-новый-пароль"
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 4) {
  console.error("Использование: node scripts/set-password.mjs \"пароль\" (минимум 4 символа)");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env");

const hash = bcrypt.hashSync(password, 12);
const b64 = Buffer.from(hash, "utf8").toString("base64");

let env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const line = `APP_PASSWORD_HASH="${b64}"`;
if (/^APP_PASSWORD_HASH=.*$/m.test(env)) {
  env = env.replace(/^APP_PASSWORD_HASH=.*$/m, line);
} else {
  env = env.replace(/\s*$/, "") + `\n${line}\n`;
}
writeFileSync(envPath, env);

console.log("Пароль обновлён. APP_PASSWORD_HASH записан в .env (base64 от bcrypt-хеша).");
console.log("Перезапустите сервер, чтобы изменения вступили в силу.");
