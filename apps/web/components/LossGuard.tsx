"use client";

import { useMemo, useState } from "react";
import { formatINR, formatINRPaise, lossGuard, type LossGuardInput } from "@/lib/engines";

type Key = keyof LossGuardInput;
const PCT: Key[] = ["scrapPct", "overheadPct", "costOfCapital", "minMargin"];

const GROUPS: { title: string; fields: { key: Key; label: string }[] }[] = [
  {
    title: "Job",
    fields: [
      { key: "quantity", label: "Pieces" },
      { key: "netKgPerPiece", label: "Net kg per piece" },
      { key: "scrapPct", label: "Scrap (%)" },
      { key: "materialRate", label: "Material rate (₹/kg)" },
    ],
  },
  {
    title: "Shop floor",
    fields: [
      { key: "machineHours", label: "Machine hours" },
      { key: "machineRate", label: "Machine rate (₹/h)" },
      { key: "labourHours", label: "Labour hours" },
      { key: "labourRate", label: "Labour rate (₹/h)" },
      { key: "outsidePerPiece", label: "Outside processing (₹/piece)" },
    ],
  },
  {
    title: "Overheads and terms",
    fields: [
      { key: "overheadPct", label: "Overhead (%)" },
      { key: "packingDelivery", label: "Packing and delivery (₹)" },
      { key: "paymentDays", label: "Buyer pays in (days)" },
      { key: "costOfCapital", label: "Cost of capital (% a year)" },
      { key: "minMargin", label: "Minimum margin (%)" },
    ],
  },
];

const toText = (input: LossGuardInput) =>
  Object.fromEntries(Object.entries(input).map(([k, v]) => [k, String(PCT.includes(k as Key) ? Math.round(v * 10000) / 100 : v)])) as Record<Key, string>;

export function LossGuard({ title, input }: { title: string; input: LossGuardInput }) {
  const [vals, setVals] = useState<Record<Key, string>>(() => toText(input));

  const r = useMemo(() => {
    const parsed = Object.fromEntries(
      Object.entries(vals).map(([k, s]) => {
        const v = Number(s);
        const num = Number.isFinite(v) && s.trim() !== "" ? Math.max(0, v) : 0;
        return [k, PCT.includes(k as Key) ? num / 100 : num];
      }),
    ) as unknown as LossGuardInput;
    return { input: parsed, out: lossGuard(parsed) };
  }, [vals]);

  const { out } = r;
  const set = (k: Key, v: string) => setVals((s) => ({ ...s, [k]: v }));
  const marginPct = Math.round(r.input.minMargin * 1000) / 10;
  const biggest = [...out.lines].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div>
        <p className="text-sm text-muted">Sample job: {title}</p>
        <div className="mt-3 space-y-4">
          {GROUPS.map((grp) => (
            <fieldset key={grp.title} className="rounded-2xl border border-line p-3">
              <legend className="px-1 text-sm font-semibold">{grp.title}</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {grp.fields.map((f) => (
                  <label key={f.key} className="block">
                    <span className="mb-1 block text-xs text-muted">{f.label}</span>
                    <input inputMode="decimal" className="field" value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <button type="button" className="link mt-3 text-sm font-semibold" onClick={() => setVals(toText(input))}>
          Reset to the sample job
        </button>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <label className="block rounded-2xl border-2 border-ink p-4">
          <span className="block font-semibold">Price you plan to quote (₹ per piece)</span>
          <input inputMode="decimal" className="field mt-2 text-xl font-semibold" value={vals.quotedPerPiece} onChange={(e) => set("quotedPerPiece", e.target.value)} />
        </label>

        <div
          aria-live="polite"
          className={`mt-4 rounded-2xl p-4 ${out.verdict === "loss" ? "bg-loss-soft text-loss" : out.verdict === "thin" ? "bg-caution-soft text-caution" : "bg-accent-soft text-accent-strong"}`}
        >
          <p className="text-lg font-bold">
            {out.verdict === "loss"
              ? `Blocked: this quote loses ${formatINR(-out.profit)}.`
              : out.verdict === "thin"
                ? `Profitable, but under your ${marginPct}% minimum margin.`
                : `Safe to send: profit ${formatINR(out.profit)}.`}
          </p>
          <p className="num mt-1 text-ink">
            Minimum safe price at {marginPct}% margin: <strong>{formatINRPaise(out.minSafePerPiece)} per piece</strong>
          </p>
        </div>

        <table className="num mt-4 w-full text-sm">
          <caption className="sr-only">Cost build-up for this job</caption>
          <tbody>
            {out.lines.map((l) => (
              <tr key={l.key} className="border-b border-line">
                <th scope="row" className="py-2 pr-3 text-left font-medium">
                  {l.label}
                  <span className="block text-xs font-normal text-muted">{l.detail}</span>
                </th>
                <td className="py-2 text-right">{formatINR(l.amount)}</td>
              </tr>
            ))}
            <tr className="border-b-2 border-ink">
              <th scope="row" className="py-2 text-left font-semibold">
                Total cost
                <span className="block text-xs font-normal text-muted">{formatINRPaise(out.costPerPiece)} per piece</span>
              </th>
              <td className="py-2 text-right font-semibold">{formatINR(out.totalCost)}</td>
            </tr>
            <tr>
              <th scope="row" className="py-2 text-left font-medium">
                Your quote
              </th>
              <td className="py-2 text-right">{formatINR(out.quoteTotal)}</td>
            </tr>
            <tr>
              <th scope="row" className="py-2 text-left font-semibold">
                {out.profit < 0 ? "Loss" : "Profit"}
              </th>
              <td className={`py-2 text-right font-semibold ${out.profit < 0 ? "text-loss" : "text-accent-strong"}`}>{formatINR(out.profit)}</td>
            </tr>
          </tbody>
        </table>
        {biggest && out.totalCost > 0 && (
          <p className="mt-3 text-sm text-muted">
            {biggest.label} is the largest line at {Math.round((biggest.amount / out.totalCost) * 100)}% of cost, so a rise in its price hits this quote first.
          </p>
        )}
      </div>
    </div>
  );
}
