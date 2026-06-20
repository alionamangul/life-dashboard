"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type RoutineFormState = { error?: string };

function taskFields(fd: FormData) {
  const days = fd
    .getAll("day")
    .map(String)
    .filter((v) => /^[1-7]$/.test(v))
    .sort()
    .join("");
  return {
    category: (String(fd.get("category") ?? "").trim() || "Прочее"),
    timeOfDay: fd.get("timeOfDay") === "EVENING" ? "EVENING" : "DAY",
    label: String(fd.get("label") ?? "").trim(),
    detail: String(fd.get("detail") ?? "").trim() || null,
    days: days || "1234567",
  };
}

export async function createRoutineTask(
  _prev: RoutineFormState,
  fd: FormData
): Promise<RoutineFormState> {
  const data = taskFields(fd);
  if (!data.label) return { error: "Укажите название задачи" };
  const max = await prisma.routineTask.aggregate({ _max: { order: true } });
  await prisma.routineTask.create({
    data: { ...data, order: (max._max.order ?? 0) + 1 },
  });
  revalidatePath("/checklists");
  redirect("/checklists/manage");
}

export async function updateRoutineTask(
  _prev: RoutineFormState,
  fd: FormData
): Promise<RoutineFormState> {
  const id = String(fd.get("id") ?? "");
  if (!id) return { error: "Не найдена задача" };
  const data = taskFields(fd);
  if (!data.label) return { error: "Укажите название задачи" };
  await prisma.routineTask.update({ where: { id }, data });
  revalidatePath("/checklists");
  redirect("/checklists/manage");
}

export async function deleteRoutineTask(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (id) {
    await prisma.routineTask.delete({ where: { id } });
    revalidatePath("/checklists");
  }
  redirect("/checklists/manage");
}

// Переключить отметку выполнения задачи на конкретную дату (флип по БД).
export async function toggleRoutineCheck(taskId: string, date: string) {
  if (!taskId || !date) return;
  const existing = await prisma.routineCheck.findUnique({
    where: { taskId_date: { taskId, date } },
  });
  if (existing) {
    await prisma.routineCheck.delete({ where: { id: existing.id } });
  } else {
    await prisma.routineCheck.create({ data: { taskId, date } });
  }
  revalidatePath("/checklists");
}
