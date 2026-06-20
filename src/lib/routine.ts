// Хелперы недельной рутины. Дни недели: 1=Пн … 7=Вс. Даты — строки YYYY-MM-DD.

export const WEEKDAY_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
export const WEEKDAY_FULL = [
  "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье",
];

export const CATEGORY_ORDER = [
  "Уход за лицом",
  "Тело и кожа",
  "Тренировка",
  "Добавки",
  "Питание и вода",
  "Дом",
];

export const CATEGORY_EMOJI: Record<string, string> = {
  "Уход за лицом": "🧴",
  "Тело и кожа": "🚿",
  "Тренировка": "🏋️",
  "Добавки": "💊",
  "Питание и вода": "🥗",
  "Дом": "🪴",
};

function ymdToUTC(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function utcToYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// 1=Пн … 7=Вс
export function weekdayOf(dateStr: string): number {
  const g = ymdToUTC(dateStr).getUTCDay(); // 0=Вс … 6=Сб
  return g === 0 ? 7 : g;
}

// Сегодняшняя дата по Москве (YYYY-MM-DD)
export function todayMoscow(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export type WeekDay = { date: string; weekday: number; dayNum: number };

// Неделя (Пн–Вс), содержащая указанную дату
export function weekDates(ref: string): WeekDay[] {
  const wd = weekdayOf(ref);
  const mon = ymdToUTC(ref);
  mon.setUTCDate(mon.getUTCDate() - (wd - 1));
  const out: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setUTCDate(mon.getUTCDate() + i);
    out.push({ date: utcToYmd(d), weekday: i + 1, dayNum: d.getUTCDate() });
  }
  return out;
}

export function dayMatches(days: string, weekday: number): boolean {
  return days.includes(String(weekday));
}

export function formatDays(days: string): string {
  if (!days || days.length === 7) return "каждый день";
  return days
    .split("")
    .map((d) => WEEKDAY_SHORT[Number(d) - 1])
    .filter(Boolean)
    .join(" ");
}

export function sortCategories(cats: string[]): string[] {
  return [...cats].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a);
    const ib = CATEGORY_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
