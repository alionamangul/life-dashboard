"use server";

import { redirect } from "next/navigation";
import { verifyPassword, createSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Введите пароль" };

  const ok = await verifyPassword(password);
  if (!ok) return { error: "Неверный пароль" };

  await createSession();

  const from = String(formData.get("from") ?? "");
  const target = from.startsWith("/") && !from.startsWith("//") ? from : "/";
  redirect(target);
}
