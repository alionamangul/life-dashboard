import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ORDER } from "@/lib/routine";
import { createRoutineTask } from "../../actions";
import { RoutineTaskForm } from "../../routine-task-form";

export const metadata: Metadata = { title: "Новая задача" };

export default async function NewRoutineTaskPage() {
  const cats = await prisma.routineTask.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const categories = [
    ...new Set([...CATEGORY_ORDER, ...cats.map((c) => c.category)]),
  ];

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-5 text-xl font-bold text-slate-900">Новая задача</h1>
      <RoutineTaskForm
        action={createRoutineTask}
        categories={categories}
        submitLabel="Добавить"
      />
    </div>
  );
}
