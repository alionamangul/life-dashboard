// Парсер списка лекарств, вставленного из Заметок iPhone.
// Формат строки: «Название MM/ГГ». Заголовки категорий: «1. НАЗВАНИЕ».
// Маркеры списка (* · - – —), пустые строки, ссылки и заголовок «Аптечка» отбрасываются.

export type ParsedMedicine = {
  name: string;
  category: string | null;
  expiryRaw: string | null; // "05/27"
  expiryDate: Date | null; // последний день указанного месяца
};

export type ParseResult = {
  items: ParsedMedicine[];
  /** Непустые строки, которые не распознаны как лекарство (ссылки исключены). */
  unrecognized: string[];
  /** Сколько строк-ссылок/мусора отброшено молча. */
  ignored: number;
};

const BULLET_PREFIX = /^[\s*•·▪◦◦\-–—]+/u;
const DATE_AT_END = /(\d{1,2})\s*\/\s*(\d{2,4})\s*$/;
const CATEGORY_LINE = /^(\d{1,2})[.)]\s+(.+)$/;

// «ЖАРОПОНИЖАЮЩИЕ И ОБЕЗБОЛИВАЮЩИЕ» → «Жаропонижающие и обезболивающие»
function normalizeCategory(s: string): string {
  const t = s.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function toExpiryDate(mm: number, yy: number): Date | null {
  if (mm < 1 || mm > 12) return null;
  const year = yy < 100 ? 2000 + yy : yy;
  // new Date(year, mm, 0) = последний день месяца mm (mm здесь 1-based)
  return new Date(year, mm, 0, 12, 0, 0, 0);
}

export function parseMedicineList(text: string): ParseResult {
  const items: ParsedMedicine[] = [];
  const unrecognized: string[] = [];
  let ignored = 0;
  let category: string | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const stripped = rawLine.replace(BULLET_PREFIX, "").trim();
    if (!stripped) continue;

    // Заголовок «АПТЕЧКА💊» и подобные — пропускаем.
    if (/^аптечк/i.test(stripped) && !DATE_AT_END.test(stripped)) continue;

    // Ссылки/конфиги (vless://, http://, …) — молча отбрасываем.
    if (stripped.includes("://")) {
      ignored++;
      continue;
    }

    // Заголовок категории «1. НАЗВАНИЕ» (без даты на конце).
    const cat = stripped.match(CATEGORY_LINE);
    if (cat && !DATE_AT_END.test(stripped)) {
      category = normalizeCategory(cat[2]);
      continue;
    }

    // Лекарство с датой на конце.
    const dateMatch = stripped.match(DATE_AT_END);
    if (dateMatch) {
      const mm = parseInt(dateMatch[1], 10);
      const yy = parseInt(dateMatch[2], 10);
      let name = stripped.slice(0, dateMatch.index).trim();
      name = name.replace(/[•·\-–—,;:]+$/u, "").trim();
      if (name) {
        items.push({
          name,
          category,
          expiryRaw: `${String(mm).padStart(2, "0")}/${String(yy).slice(-2).padStart(2, "0")}`,
          expiryDate: toExpiryDate(mm, yy),
        });
        continue;
      }
    }

    // Прочее непустое — в «нераспознанные» для ручного разбора.
    unrecognized.push(stripped);
  }

  return { items, unrecognized, ignored };
}
