"use client";

import { useMemo, useState } from "react";
import { formatDateShort, formatINR, isISODate, rankSuppliers, type RankingContext, type SupplierQuote } from "@/lib/engines";

type Num = string; // inputs are kept as text so a field can be blank while typing

interface Row {
  id: string;
  name: string;
  rate: Num;
  qty: Num;
  freight: Num;
  loading: Num;
  creditDays: Num;
  promised: string;
  onTimePct: Num;
  slipDays: Num;
}

interface Globals {
  customerDate: string;
  productionDays: Num;
  bufferDays: Num;
  costPerDayDelay: Num;
  costOfCapitalPct: Num;
  itcClaimable: boolean;
}

const n = (s: Num, fallback = 0) => {
  const v = Number(s);
  return Number.isFinite(v) && s.trim() !== "" ? Math.max(0, v) : fallback;
};

export interface CalcSeed {
  context: RankingContext;
  suppliers: (SupplierQuote & { place: string })[];
}

function fromSeed(seed: CalcSeed): { rows: Row[]; globals: Globals } {
  return {
    rows: seed.suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      rate: String(s.rate),
      qty: String(s.qty),
      freight: String(s.freight),
      loading: String(s.loading),
      creditDays: String(s.creditDays),
      promised: s.promised,
      onTimePct: String(Math.round(s.onTime * 100)),
      slipDays: String(s.slipDays),
    })),
    globals: {
      customerDate: seed.context.customerDate,
      productionDays: String(seed.context.productionDays),
      bufferDays: String(seed.context.bufferDays),
      costPerDayDelay: String(seed.context.costPerDayDelay),
      costOfCapitalPct: String(Math.round(seed.context.costOfCapital * 10000) / 100),
      itcClaimable: seed.context.itcClaimable,
    },
  };
}

const FIELDS: { key: keyof Row; label: string; suffix?: string; type?: "date" }[] = [
  { key: "rate", label: "Rate per ton", suffix: "₹" },
  { key: "qty", label: "Quantity", suffix: "t" },
  { key: "freight", label: "Freight", suffix: "₹" },
  { key: "loading", label: "Loading", suffix: "₹" },
  { key: "creditDays", label: "Credit", suffix: "days" },
  { key: "promised", label: "Promised arrival", type: "date" },
  { key: "onTimePct", label: "On time", suffix: "%" },
  { key: "slipDays", label: "Typical slip", suffix: "days" },
];

export function SupplierCalculator({ seed, gstRate }: { seed: CalcSeed; gstRate: number }) {
  const initial = useMemo(() => fromSeed(seed), [seed]);
  const [rows, setRows] = useState<Row[]>(initial.rows);
  const [g, setG] = useState<Globals>(initial.globals);

  const ranking = useMemo(() => {
    const ctx: RankingContext = {
      customerDate: isISODate(g.customerDate) ? g.customerDate : seed.context.customerDate,
      productionDays: Math.round(n(g.productionDays)),
      bufferDays: Math.round(n(g.bufferDays)),
      costPerDayDelay: n(g.costPerDayDelay),
      costOfCapital: n(g.costOfCapitalPct) / 100,
      gstRate,
      itcClaimable: g.itcClaimable,
    };
    const quotes: SupplierQuote[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      qty: n(r.qty),
      rate: n(r.rate),
      freight: n(r.freight),
      loading: n(r.loading),
      creditDays: n(r.creditDays),
      promised: isISODate(r.promised) ? r.promised : ctx.customerDate,
      onTime: Math.min(1, n(r.onTimePct) / 100),
      slipDays: n(r.slipDays),
    }));
    return rankSuppliers(quotes, ctx);
  }, [rows, g, gstRate, seed.context.customerDate]);

  const setRow = (i: number, key: keyof Row, value: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  const best = ranking.rows.find((r) => r.recommended);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div>
        <fieldset className="rounded-2xl border border-line p-4">
          <legend className="px-1 font-semibold">The order</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Labelled label="Customer delivery date">
              <input type="date" className="field" value={g.customerDate} onChange={(e) => setG({ ...g, customerDate: e.target.value })} />
            </Labelled>
            <Labelled label="Production days">
              <input inputMode="numeric" className="field" value={g.productionDays} onChange={(e) => setG({ ...g, productionDays: e.target.value })} />
            </Labelled>
            <Labelled label="Buffer days">
              <input inputMode="numeric" className="field" value={g.bufferDays} onChange={(e) => setG({ ...g, bufferDays: e.target.value })} />
            </Labelled>
            <Labelled label="Cost of one day's delay (₹)">
              <input inputMode="numeric" className="field" value={g.costPerDayDelay} onChange={(e) => setG({ ...g, costPerDayDelay: e.target.value })} />
            </Labelled>
            <Labelled label="Cost of capital (% a year)">
              <input inputMode="decimal" className="field" value={g.costOfCapitalPct} onChange={(e) => setG({ ...g, costOfCapitalPct: e.target.value })} />
            </Labelled>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" className="size-5 accent-[var(--color-accent)]" checked={g.itcClaimable} onChange={(e) => setG({ ...g, itcClaimable: e.target.checked })} />
              GST credit claimable
            </label>
          </div>
          <p className="mt-3 text-sm text-muted">
            Material is needed by <strong className="num text-ink">{formatDateShort(ranking.needBy)}</strong> (delivery date minus production and buffer days).
            {!g.itcClaimable && ` Without GST credit, ${Math.round(gstRate * 100)}% GST is added to landed cost.`}
          </p>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {rows.map((r, i) => (
            <fieldset key={r.id} className="rounded-2xl border border-line p-3">
              <legend className="px-1 text-sm font-semibold">{r.name}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                {FIELDS.map((f) => (
                  <Labelled key={f.key} label={`${f.label}${f.suffix ? ` (${f.suffix})` : ""}`} small>
                    <input
                      type={f.type === "date" ? "date" : "text"}
                      inputMode={f.type === "date" ? undefined : "decimal"}
                      className="field"
                      value={r[f.key]}
                      onChange={(e) => setRow(i, f.key, e.target.value)}
                    />
                  </Labelled>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <button type="button" className="link mt-3 text-sm font-semibold" onClick={() => (setRows(initial.rows), setG(initial.globals))}>
          Reset to the sample quotes
        </button>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-4" aria-live="polite">
          <h3 className="font-semibold">Ranking</h3>
          <ol className="mt-3 space-y-2">
            {ranking.rows.map((r, i) => {
              const late = r.risk.missesDeadline;
              return (
                <li key={r.quote.id} className={`rounded-xl border bg-paper p-3 ${r.recommended ? "border-accent ring-1 ring-accent" : "border-line"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">
                      <span className="num mr-2 text-muted">{i + 1}</span>
                      {r.quote.name}
                    </p>
                    {r.recommended ? (
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">Recommended</span>
                    ) : late ? (
                      <span className="rounded-full bg-loss-soft px-2.5 py-0.5 text-xs font-semibold text-loss">Misses deadline</span>
                    ) : null}
                  </div>
                  <dl className="num mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm sm:grid-cols-4">
                    <Stat label="Landed" value={formatINR(r.cost.landed)} />
                    <Stat label="Arrives" value={formatDateShort(r.quote.promised)} bad={late} />
                    <Stat label="Delay risk" value={formatINR(r.risk.delayCost)} bad={r.risk.delayCost > 0} />
                    <Stat label="Effective" value={formatINR(r.effective)} strong />
                  </dl>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-sm">{ranking.explanation}</p>
          {best && best.cost.creditBenefit > 0 && (
            <p className="mt-2 text-xs text-muted">
              Credit days on {best.quote.name} are worth {formatINR(best.cost.creditBenefit)} at your cost of capital.
            </p>
          )}
        </div>
        <details className="mt-3 text-sm text-muted">
          <summary className="cursor-pointer font-medium text-ink">How the numbers are worked out</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Landed = rate × quantity + freight + loading + GST if no credit − value of credit days.</li>
            <li>Need-by = customer date − production days − buffer.</li>
            <li>Expected delay days = days late on the promise, plus the chance of slipping × typical slip.</li>
            <li>Effective = landed + expected delay days × cost of one day's delay.</li>
            <li>A supplier promising after the need-by date is shown but never recommended.</li>
          </ul>
        </details>
      </div>
    </div>
  );
}

function Labelled({ label, children, small = false }: { label: string; children: React.ReactNode; small?: boolean }) {
  return (
    <label className="block">
      <span className={`mb-1 block ${small ? "text-xs" : "text-sm"} text-muted`}>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, bad = false, strong = false }: { label: string; value: string; bad?: boolean; strong?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`${bad ? "text-loss" : ""} ${strong ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}
