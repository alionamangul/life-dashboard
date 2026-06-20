"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseMonthInput } from "@/lib/medicine";
import { parseMedicineList } from "@/lib/medicine-import";

export type MedicineFormState = { error?: string };

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v ? v : null;
}

function fields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: str(formData, "category"),
    quantity: str(formData, "quantity"),
    purpose: str(formData, "purpose"),
    notes: str(formData, "notes"),
    expiryDate: parseMonthInput(String(formData.get("expiry") ?? "")),
    needToBuy: formData.get("needToBuy") === "on",
  };
}

export async function createMedicine(
  _prev: MedicineFormState,
  formData: FormData
): Promise<MedicineFormState> {
  const data = fields(formData);
  if (!data.name) return { error: "Укажите название" };
  await prisma.medicine.create({ data });
  revalidatePath("/medicine");
  redirect("/medicine");
}

export async function updateMedicine(
  _prev: MedicineFormState,
  formData: FormData
): Promise<MedicineFormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Не найдена запись" };
  const data = fields(formData);
  if (!data.name) return { error: "Укажите название" };
  await prisma.medicine.update({ where: { id }, data });
  revalidatePath("/medicine");
  redirect("/medicine");
}

export async function deleteMedicine(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.medicine.delete({ where: { id } });
    revalidatePath("/medicine");
  }
  redirect("/medicine");
}

// Удаление прямо из списка — без редиректа, остаёмся в текущем виде.
export async function removeMedicine(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.medicine.delete({ where: { id } });
  revalidatePath("/medicine");
  revalidatePath("/");
}

// Отметить «куплено» — убрать из списка «нужно купить».
export async function markBought(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.medicine.update({
    where: { id },
    data: { needToBuy: false },
  });
  revalidatePath("/medicine");
}

// Быстрое добавление лекарства в список «нужно купить».
export async function quickAddBuy(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const quantity = str(formData, "quantity");
  await prisma.medicine.create({
    data: { name, quantity, needToBuy: true },
  });
  revalidatePath("/medicine");
}

export type ImportState = { error?: string };

export async function importMedicines(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  const text = String(formData.get("text") ?? "");
  const replace = formData.get("replace") === "on";
  const { items } = parseMedicineList(text);
  if (items.length === 0) {
    return { error: "Не найдено ни одного лекарства. Проверьте формат списка." };
  }

  if (replace) {
    await prisma.medicine.deleteMany({});
  }
  await prisma.medicine.createMany({
    data: items.map((it) => ({
      name: it.name,
      category: it.category,
      expiryDate: it.expiryDate,
    })),
  });

  revalidatePath("/medicine");
  revalidatePath("/");
  redirect("/medicine");
}
