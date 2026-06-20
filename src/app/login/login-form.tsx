"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {from ? <input type="hidden" name="from" value={from} /> : null}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-600">Пароль</span>
        <input
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          inputMode="text"
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="Введите пароль"
        />
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition active:scale-[.99] disabled:opacity-60"
      >
        {pending ? "Вход…" : "Войти"}
      </button>
    </form>
  );
}
