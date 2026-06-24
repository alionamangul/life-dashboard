// Хелперы для раздела «Дети»: возраст, склонения, формат дат.

export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function ageParts(
  birth: Date | string,
  now: Date = new Date()
): { years: number; months: number } {
  const b = typeof birth === "string" ? new Date(birth) : birth;
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years: Math.max(0, years), months: Math.max(0, months) };
}

// «7 лет», «1 год 11 мес», «5 мес»
export function ageString(birth: Date | string | null, now: Date = new Date()): string {
  if (!birth) return "";
  const { years, months } = ageParts(birth, now);
  const y = `${years} ${pluralRu(years, "год", "года", "лет")}`;
  if (years === 0) return `${months} мес`;
  if (years < 5) return `${y} ${months} мес`;
  return y;
}

const MONTHS_RU = [
  "янв", "фев", "мар", "апр", "мая", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

// «30 янв 2019»
export function formatDateRu(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

// дней до даты (отрицательное — в прошлом)
export function daysUntil(date: Date | string, now: Date = new Date()): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86400000);
}

export const EVENT_TYPES = [
  { value: "DOCTOR", label: "Врач", emoji: "🩺" },
  { value: "CHECKUP", label: "Проверка", emoji: "📋" },
  { value: "TRIP", label: "Выезд", emoji: "✈️" },
  { value: "OTHER", label: "Другое", emoji: "📌" },
];

export function eventMeta(type: string) {
  return EVENT_TYPES.find((t) => t.value === type) ?? EVENT_TYPES[3];
}
