import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Attachments, type AttachmentView } from "@/components/attachments";
import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  ageString,
  formatDateRu,
  daysUntil,
  EVENT_TYPES,
  eventMeta,
} from "@/lib/children";
import { GrowthChart, type Measure } from "./growth-chart";
import {
  addMeasurement,
  deleteMeasurement,
  addChildEvent,
  deleteChildEvent,
  toggleEventDone,
} from "../actions";

export const metadata: Metadata = { title: "Профиль ребёнка" };

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default async function ChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [kid, measurements, events, atts] = await Promise.all([
    prisma.person.findUnique({ where: { id } }),
    prisma.growthMeasurement.findMany({
      where: { personId: id },
      orderBy: { date: "desc" },
    }),
    prisma.childEvent.findMany({
      where: { personId: id },
      orderBy: { date: "asc" },
    }),
    prisma.attachment.findMany({
      where: { entityType: "child", entityId: id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!kid || kid.kind !== "CHILD") notFound();

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const chartData: Measure[] = measurements.map((m) => ({
    date: m.date.toISOString(),
    heightCm: m.heightCm,
    weightKg: m.weightKg,
  }));

  const photoItems: AttachmentView[] = atts.map((a) => ({
    id: a.id,
    kind: a.kind === "PDF" ? "PDF" : "IMAGE",
    fileName: a.fileName,
  }));

  const upcoming = events.filter((e) => !e.done && daysUntil(e.date, now) >= 0);
  const rest = events.filter((e) => e.done || daysUntil(e.date, now) < 0);

  const addM = addMeasurement.bind(null, id);
  const addE = addChildEvent.bind(null, id);

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/children"
          aria-label="Назад"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 active:bg-slate-100"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{kid.name}</h1>
          <p className="text-sm text-slate-500">
            {ageString(kid.birthDate, now)} · {formatDateRu(kid.birthDate)}
          </p>
        </div>
      </div>

      {/* Фото */}
      <div className="mb-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <Attachments
          entityType="child"
          entityId={id}
          revalidate={`/children/${id}`}
          items={photoItems}
          label="Фото"
        />
      </div>

      {/* Рост и вес */}
      <h2 className="mb-2 px-1 text-base font-bold text-slate-800">Рост и вес</h2>
      <GrowthChart measurements={chartData} />

      <details className="mt-2">
        <summary className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700">
          + Добавить замер
        </summary>
        <form action={addM} className="mt-2 flex flex-col gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
          <div className="grid grid-cols-3 gap-2">
            <input type="date" name="date" defaultValue={today} className={inputCls} />
            <input name="heightCm" inputMode="decimal" placeholder="Рост, см" className={inputCls} />
            <input name="weightKg" inputMode="decimal" placeholder="Вес, кг" className={inputCls} />
          </div>
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white">
            Сохранить замер
          </button>
        </form>
      </details>

      {measurements.length > 0 && (
        <ul className="mt-3 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
          {measurements.map((m) => (
            <li key={m.id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0">
              <span className="w-24 shrink-0 text-xs text-slate-400">{formatDateRu(m.date)}</span>
              <span className="flex-1 text-sm text-slate-700">
                {m.heightCm != null ? `${m.heightCm} см` : ""}
                {m.heightCm != null && m.weightKg != null ? " · " : ""}
                {m.weightKg != null ? `${m.weightKg} кг` : ""}
              </span>
              <form action={deleteMeasurement}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="personId" value={id} />
                <button type="submit" aria-label="Удалить" className="text-slate-300 active:text-red-500">✕</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* События */}
      <h2 className="mb-2 mt-7 px-1 text-base font-bold text-slate-800">События</h2>

      <details className="mb-3">
        <summary className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700">
          + Добавить событие
        </summary>
        <form action={addE} className="mt-2 flex flex-col gap-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
          <input name="title" required placeholder="Например: приём у педиатра" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <select name="type" defaultValue="DOCTOR" className={inputCls}>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
            <input type="date" name="date" defaultValue={today} className={inputCls} />
          </div>
          <input name="location" placeholder="Место (необязательно)" className={inputCls} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Напомнить за
            <input name="reminderDays" inputMode="numeric" defaultValue="2" className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center" />
            дн.
          </label>
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white">
            Добавить событие
          </button>
        </form>
      </details>

      {events.length === 0 ? (
        <p className="text-center text-sm text-slate-400">Событий пока нет.</p>
      ) : (
        <div className="space-y-3">
          {upcoming.length > 0 && (
            <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
              {upcoming.map((e) => (
                <EventRow key={e.id} e={e} personId={id} now={now} />
              ))}
            </ul>
          )}
          {rest.length > 0 && (
            <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 opacity-70">
              {rest.map((e) => (
                <EventRow key={e.id} e={e} personId={id} now={now} past />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({
  e,
  personId,
  now,
  past,
}: {
  e: { id: string; title: string; type: string; date: Date; location: string | null; done: boolean };
  personId: string;
  now: Date;
  past?: boolean;
}) {
  const meta = eventMeta(e.type);
  const days = daysUntil(e.date, now);
  const soon = !e.done && days >= 0 && days <= 7;
  return (
    <li className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
      <span className="text-xl">{meta.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className={`font-medium ${e.done ? "text-slate-400 line-through" : "text-slate-900"}`}>
          {e.title}
        </div>
        <div className="mt-0.5 text-xs text-slate-400">
          {formatDateRu(e.date)}
          {e.location ? ` · ${e.location}` : ""}
          {!e.done && days >= 0 ? (
            <span className={soon ? "ml-1 font-medium text-amber-600" : "ml-1 text-slate-400"}>
              · {days === 0 ? "сегодня" : `через ${days} дн.`}
            </span>
          ) : null}
        </div>
      </div>
      <form action={toggleEventDone.bind(null, e.id)}>
        <button
          type="submit"
          aria-label="Выполнено"
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm ${
            e.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent"
          }`}
        >
          ✓
        </button>
      </form>
      <form action={deleteChildEvent}>
        <input type="hidden" name="id" value={e.id} />
        <input type="hidden" name="personId" value={personId} />
        <ConfirmSubmit message={`Удалить «${e.title}»?`} className="text-slate-300 active:text-red-500">
          ✕
        </ConfirmSubmit>
      </form>
    </li>
  );
}
