export function Stub({
  title,
  emoji,
  note = "Раздел появится здесь на следующем шаге.",
}: {
  title: string;
  emoji: string;
  note?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        {note}
      </div>
    </div>
  );
}
