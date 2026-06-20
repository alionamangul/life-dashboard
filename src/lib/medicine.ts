// Хелперы для аптечки. Чистые функции — используются и на сервере, и на клиенте.

export const EXPIRING_SOON_DAYS = 90;

export type ExpiryStatus = "expired" | "soon" | "ok" | "none";

export function expiryStatus(
  date: Date | string | null | undefined,
  now: Date = new Date()
): ExpiryStatus {
  if (!date) return "none";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "none";
  const days = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "expired";
  if (days <= EXPIRING_SOON_DAYS) return "soon";
  return "ok";
}

const MONTHS = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
];

// Дата → «05/27»
export function formatExpiry(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`;
}

// Дата → «2027-05» (для <input type="month">)
export function monthInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${MONTHS[d.getMonth()]}`;
}

// «2027-05» → последний день месяца (как в импорте)
export function parseMonthInput(v: string | null | undefined): Date | null {
  if (!v) return null;
  const m = v.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return null;
  return new Date(year, mm, 0, 12, 0, 0, 0);
}

export const EXPIRY_BADGE: Record<ExpiryStatus, string> = {
  expired: "bg-red-100 text-red-700",
  soon: "bg-amber-100 text-amber-700",
  ok: "bg-slate-100 text-slate-600",
  none: "bg-slate-100 text-slate-400",
};

export const EXPIRY_LABEL: Record<ExpiryStatus, string> = {
  expired: "просрочено",
  soon: "скоро истекает",
  ok: "годен",
  none: "без срока",
};
