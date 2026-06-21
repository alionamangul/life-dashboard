"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function str(fd: FormData, key: string): string | null {
  const v = String(fd.get(key) ?? "").trim();
  return v ? v : null;
}

async function listIdForKind(kind: string): Promise<string | null> {
  const l = await prisma.shoppingList.findFirst({ where: { kind } });
  return l?.id ?? null;
}

export async function addShoppingItem(kind: string, fd: FormData): Promise<void> {
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  const listId = await listIdForKind(kind);
  if (!listId) return;
  const max = await prisma.shoppingItem.aggregate({
    where: { listId },
    _max: { order: true },
  });
  await prisma.shoppingItem.create({
    data: {
      listId,
      name,
      quantity: str(fd, "quantity"),
      personId: kind === "KIDS" ? str(fd, "personId") : null,
      order: (max._max.order ?? 0) + 1,
    },
  });
  revalidatePath("/shopping");
}

// Переключить «куплено» (флип по БД).
export async function toggleShoppingBought(id: string): Promise<void> {
  if (!id) return;
  const it = await prisma.shoppingItem.findUnique({ where: { id } });
  if (!it) return;
  await prisma.shoppingItem.update({
    where: { id },
    data: { bought: !it.bought },
  });
  revalidatePath("/shopping");
}

export async function deleteShoppingItem(fd: FormData): Promise<void> {
  const id = String(fd.get("id") ?? "");
  if (id) {
    await prisma.shoppingItem.delete({ where: { id } });
    revalidatePath("/shopping");
  }
}

export async function clearBought(kind: string): Promise<void> {
  const listId = await listIdForKind(kind);
  if (listId) {
    await prisma.shoppingItem.deleteMany({ where: { listId, bought: true } });
    revalidatePath("/shopping");
  }
}
