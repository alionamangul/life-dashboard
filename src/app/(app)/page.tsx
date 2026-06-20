import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Центр жизни</h1>
      <p className="mt-1 text-sm text-slate-500">Всё важное в одном месте</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className="group flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition active:scale-[.98] hover:ring-slate-300"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${s.iconClass}`}
            >
              {s.emoji}
            </span>
            <span className="mt-1 font-semibold text-slate-900">{s.title}</span>
            <span className="text-xs leading-snug text-slate-500">
              {s.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
