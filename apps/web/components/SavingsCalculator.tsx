"use client";

import { useState } from "react";
import { formatINR, savings, type SavingsInput } from "@/lib/engines";

const CRORE = 1e7;
const LAKH = 1e5;

export function SavingsCalculator({ defaults }: { defaults: SavingsInput }) {
  const [v, setV] = useState(defaults);
  const r = savings(v);
  const set = (k: keyof SavingsInput, x: number) => setV((s) => ({ ...s, [k]: x }));

  const sliders: { key: keyof SavingsInput; label: string; min: number; max: number; step: number; scale: number; show: (n: number) => string }[] = [
    { key: "turnover", label: "Annual turnover", min: 0.5, max: 50, step: 0.5, scale: CRORE, show: (n) => `₹${n} crore` },
    { key: "materialShare", label: "Material as a share of sales", min: 20, max: 80, step: 1, scale: 0.01, show: (n) => `${n}%` },
    { key: "savingPct", label: "Expected saving on material", min: 0, max: 8, step: 0.5, scale: 0.01, show: (n) => `${n}%` },
    { key: "lossesAvoided", label: "Loss-making orders avoided a year", min: 0, max: 12, step: 1, scale: 1, show: (n) => `${n}` },
    { key: "avgLoss", label: "Average loss on such an order", min: 0, max: 5, step: 0.1, scale: LAKH, show: (n) => `₹${n} lakh` },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        {sliders.map((s) => {
          const ui = Math.round((v[s.key] / s.scale) * 100) / 100;
          return (
            <label key={s.key} className="block">
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span>{s.label}</span>
                <span className="num font-semibold">{s.show(ui)}</span>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={ui}
                onChange={(e) => set(s.key, Number(e.target.value) * s.scale)}
                className="mt-2 w-full accent-[var(--color-accent)]"
              />
            </label>
          );
        })}
      </div>
      <div className="self-start rounded-2xl bg-ink p-5 text-white" aria-live="polite">
        <p className="text-sm text-white/80">Money kept a year</p>
        <p className="num mt-1 text-4xl font-bold">{formatINR(r.total)}</p>
        <dl className="num mt-4 space-y-1 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-white/80">Material bought a year</dt>
            <dd>{formatINR(r.materialSpend)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/80">Saved on material</dt>
            <dd>{formatINR(r.materialSaving)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-white/80">Losses avoided</dt>
            <dd>{formatINR(r.lossSaving)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-white/75">Illustrative, based on the assumptions you set. Pilot results will replace these defaults.</p>
      </div>
    </div>
  );
}
