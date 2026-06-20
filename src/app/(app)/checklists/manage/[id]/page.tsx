import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_ORDER } from "@/lib/routine";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { updateRoutineTask, deleteRoutineTask } from "../../actions";
import { RoutineTaskForm } from "../../routine-task-form";

export const metadata: Metadata = { title: "Задача рутины" };

export default async function EditRoutineTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [task, cats] = await Promise.all([
    prisma.routineTask.findUnique({ where: { id } }),
    prisma.routineTask.findMany({ select: { category: true }, distinct: ["category"] }),
  ]);
  if (!task) notFound();

  const categories = [
    ...new Set([...CATEGORY_ORDER, ...cats.map((c) => c.category)]),
  ];

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-5 text-xl font-bold text-slate-900">Задача рутины</h1>
      <RoutineTaskForm
        action={updateRoutineTask}
        submitLabel="Сохранить"
        categories={categories}
        initial={{
          id: task.id,
          category: task.category,
          timeOfDay: task.timeOfDay,
          label: task.label,
          detail: task.detail,
          days: task.days,
        }}
      />

      <form action={deleteRoutineTask} className="mt-6">
        <input type="hidden" name="id" value={task.id} />
        <ConfirmSubmit
          message={`Удалить задачу «${task.label}»?`}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 active:bg-red-100"
        >
          Удалить задачу
        </ConfirmSubmit>
      </form>
    </div>
  );
}
