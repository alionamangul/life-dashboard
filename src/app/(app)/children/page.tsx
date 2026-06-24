import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ageString, daysUntil, formatDateRu, eventMeta } from "@/lib/children";

export const metadata: Metadata = { title: "Дети" };

export default async function ChildrenPage() {
  const kids = await prisma.person.findMany({
    where: { kind: "CHILD" },
    orderBy: { birthDate: "asc" },
  });
  const ids = kids.map((k) => k.id);

  const [photos, events] = await Promise.all([
    prisma.attachment.findMany({
      where: { entityType: "child", entityId: { in: ids }, kind: "IMAGE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.childEvent.findMany({
      where: { personId: { in: ids }, done: false },
      orderBy: { date: "asc" },
    }),
  ]);

  const photoByKid = new Map<string, string>();
  for (const p of photos) if (!photoByKid.has(p.entityId)) photoByKid.set(p.entityId, p.id);

  const now = new Date();
  const nextEventByKid = new Map<string, (typeof events)[number]>();
  for (const e of events) {
    if (daysUntil(e.date, now) >= 0 && !nextEventByKid.has(e.personId)) {
      nextEventByKid.set(e.personId, e);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">👶</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Дети</h1>
          <p className="text-sm text-slate-500">{kids.length} профиля</p>
        </div>
      </div>

      {kids.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-400">Нет детей в базе.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {kids.map((k) => {
            const photoId = photoByKid.get(k.id);
            const next = nextEventByKid.get(k.id);
            return (
              <Link
                key={k.id}
                href={`/children/${k.id}`}
                className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200 active:bg-slate-50"
              >
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: k.color }}
                >
                  {photoId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/files/${photoId}?thumb=1`}
                      alt={k.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    k.name.slice(0, 1)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold text-slate-900">{k.name}</div>
                  <div className="text-sm text-slate-500">{ageString(k.birthDate, now)}</div>
                  {next ? (
                    <div className="mt-0.5 truncate text-xs text-indigo-600">
                      {eventMeta(next.type).emoji} {next.title} ·{" "}
                      {formatDateRu(next.date)}
                    </div>
                  ) : null}
                </div>
                <span className="text-slate-300">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
