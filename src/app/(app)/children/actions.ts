"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function num(fd: FormData, key: string): number | null {
  const v = String(fd.get(key) ?? "").trim().replace(",", ".");
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function str(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v ? v : null;
}

function dateOrToday(fd: FormData, key: string): Date {
  const v = String(fd.get(key) ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T12:00:00Z`);
  return new Date();
}

// ── Замеры роста/веса ──
export async function addMeasurement(personId: string, fd: FormData): Promise<void> {
  const heightCm = num(fd, "heightCm");
  const weightKg = num(fd, "weightKg");
  if (heightCm == null && weightKg == null) return;
  await prisma.growthMeasurement.create({
    data: {
      personId,
      date: dateOrToday(fd, "date"),
      heightCm,
      weightKg,
      note: str(fd, "note"),
    },
  });
  revalidatePath(`/children/${personId}`);
}

export async function deleteMeasurement(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "");
  const personId = String(fd.get("personId") ?? "");
  if (id) {
    await prisma.growthMeasurement.delete({ where: { id } });
    revalidatePath(`/children/${personId}`);
  }
}

// ── События (врачи/проверки/выезды) ──
export async function addChildEvent(personId: string, fd: FormData): Promise<void> {
  const title = String(fd.get("title") ?? "").trim();
  if (!title) return;
  await prisma.childEvent.create({
    data: {
      personId,
      title,
      type: String(fd.get("type") ?? "OTHER"),
      date: dateOrToday(fd, "date"),
      location: str(fd, "location"),
      notes: str(fd, "notes"),
      reminderDays: num(fd, "reminderDays") ?? 2,
    },
  });
  revalidatePath(`/children/${personId}`);
  revalidatePath("/children");
}

export async function deleteChildEvent(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "");
  const personId = String(fd.get("personId") ?? "");
  if (id) {
    await prisma.childEvent.delete({ where: { id } });
    revalidatePath(`/children/${personId}`);
    revalidatePath("/children");
  }
}

export async function toggleEventDone(id: string): Promise<void> {
  if (!id) return;
  const ev = await prisma.childEvent.findUnique({ where: { id } });
  if (!ev) return;
  await prisma.childEvent.update({ where: { id }, data: { done: !ev.done } });
  revalidatePath(`/children/${ev.personId}`);
  revalidatePath("/children");
}
