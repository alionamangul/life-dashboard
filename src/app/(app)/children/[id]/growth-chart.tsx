"use client";

import { useMemo, useState } from "react";

export type Measure = {
  date: string; // ISO
  heightCm: number | null;
  weightKg: number | null;
};

export function GrowthChart({ measurements }: { measurements: Measure[] }) {
  const [metric, setMetric] = useState<"height" | "weight">("height");

  const series = useMemo(() => {
    return measurements
      .map((m) => ({
        t: new Date(m.date).getTime(),
        v: metric === "height" ? m.heightCm : m.weightKg,
      }))
      .filter((p): p is { t: number; v: number } => p.v != null)
      .sort((a, b) => a.t - b.t);
  }, [measurements, metric]);

  const unit = metric === "height" ? "см" : "кг";

  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="mb-3 flex gap-2">
        <Toggle active={metric === "height"} onClick={() => setMetric("height")}>
          Рост
        </Toggle>
        <Toggle active={metric === "weight"} onClick={() => setMetric("weight")}>
          Вес
        </Toggle>
      </div>
      {series.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Нет данных по «{metric === "height" ? "росту" : "весу"}». Добавьте замер
          ниже.
        </p>
      ) : (
        <Chart series={series} unit={unit} />
      )}
    </div>
  );
}

function Chart({
  series,
  unit,
}: {
  series: { t: number; v: number }[];
  unit: string;
}) {
  const W = 320;
  const H = 180;
  const padL = 38;
  const padR = 12;
  const padT = 12;
  const padB = 24;

  const ts = series.map((p) => p.t);
  const vs = series.map((p) => p.v);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  let vMin = Math.min(...vs);
  let vMax = Math.max(...vs);
  if (vMin === vMax) {
    vMin -= 1;
    vMax += 1;
  }
  const vPad = (vMax - vMin) * 0.12;
  vMin -= vPad;
  vMax += vPad;

  const x = (t: number) =>
    tMax === tMin ? (padL + W - padR) / 2 : padL + ((t - tMin) / (tMax - tMin)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - vMin) / (vMax - vMin)) * (H - padT - padB);

  const pts = series.map((p) => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`);
  const line = pts.join(" ");

  const fmtDate = (t: number) => {
    const d = new Date(t);
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getFullYear()).slice(-2)}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {/* сетка по Y: min / mid / max */}
      {[vMax, (vMax + vMin) / 2, vMin].map((v, i) => {
        const yy = y(v);
        return (
          <g key={i}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 6} y={yy + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
              {v.toFixed(metric_decimals(v))}
            </text>
          </g>
        );
      })}

      {/* линия */}
      <polyline points={line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* точки */}
      {series.map((p, i) => (
        <g key={i}>
          <circle cx={x(p.t)} cy={y(p.v)} r="3.5" fill="#6366f1" />
          {(i === 0 || i === series.length - 1) && (
            <text x={x(p.t)} y={y(p.v) - 8} textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="600">
              {p.v}
            </text>
          )}
        </g>
      ))}

      {/* подписи дат по краям */}
      <text x={padL} y={H - 8} textAnchor="start" fontSize="9" fill="#94a3b8">
        {fmtDate(tMin)}
      </text>
      {tMax !== tMin && (
        <text x={W - padR} y={H - 8} textAnchor="end" fontSize="9" fill="#94a3b8">
          {fmtDate(tMax)}
        </text>
      )}
      <text x={W - padR} y={padT} textAnchor="end" fontSize="9" fill="#cbd5e1">
        {unit}
      </text>
    </svg>
  );
}

function metric_decimals(v: number): number {
  return Number.isInteger(v) ? 0 : 1;
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium ${
        active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
