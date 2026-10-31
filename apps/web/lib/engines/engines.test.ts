import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  delayRisk,
  landedCost,
  lossGuard,
  needByDate,
  negotiationSaving,
  rankSuppliers,
  savings,
  type SupplierQuote,
} from "./index";

// Shared with packages/engines (pytest) so the two engines can never drift apart.
const vectors = JSON.parse(readFileSync(resolve(__dirname, "../../../../tests/vectors.json"), "utf8"));
const TOL = 2; // 2 decimal places

const sv = vectors.supplier;
const ctx = sv.context;

describe("need-by date", () => {
  it("works back from the customer date", () => {
    expect(needByDate(ctx.customerDate, ctx.productionDays, ctx.bufferDays)).toBe(sv.expectedNeedBy);
  });
});

describe("landed cost and delay risk", () => {
  for (const c of sv.cases) {
    it(`case ${c.id}`, () => {
      const itc = c.itcClaimable ?? ctx.itcClaimable;
      const cost = landedCost({ ...c.quote, gstRate: ctx.gstRate, itcClaimable: itc, costOfCapital: ctx.costOfCapital });
      const risk = delayRisk({
        needBy: sv.expectedNeedBy,
        promised: c.quote.promised,
        onTime: c.quote.onTime,
        slipDays: c.quote.slipDays,
        costPerDay: ctx.costPerDayDelay,
      });
      expect(cost.landed).toBeCloseTo(c.expected.landed, TOL);
      expect(risk.delayDays).toBeCloseTo(c.expected.delayDays, TOL);
      expect(risk.delayCost).toBeCloseTo(c.expected.delayCost, TOL);
      expect(cost.landed + risk.delayCost).toBeCloseTo(c.expected.effective, TOL);
      expect(risk.missesDeadline).toBe(c.expected.missesDeadline);
    });
  }
});

describe("ranking", () => {
  const byId = Object.fromEntries(sv.cases.map((c: { id: string; quote: object }) => [c.id, { id: c.id, name: c.id, ...c.quote }]));
  for (const r of sv.rankings) {
    it(`recommends ${r.recommended} from ${r.ids.join(", ")}`, () => {
      const quotes: SupplierQuote[] = r.ids.map((id: string) => byId[id]);
      const ranking = rankSuppliers(quotes, ctx);
      expect(ranking.recommendedId).toBe(r.recommended);
      expect(ranking.rows.map((row) => row.quote.id)).toEqual(r.order);
      expect(ranking.needBy).toBe(sv.expectedNeedBy);
    });
  }

  it("explains why the cheapest on paper is not picked", () => {
    const ranking = rankSuppliers(["A", "B", "C"].map((id) => byId[id]), ctx);
    expect(ranking.explanation).toContain("B costs ₹3,500 more than A");
    expect(ranking.explanation).toContain("₹9,600");
    expect(ranking.explanation).toContain("C is cheapest on paper");
  });

  it("recommends nobody when every supplier is late", () => {
    const late = { ...byId.C, id: "X", name: "X" };
    const ranking = rankSuppliers([late], ctx);
    expect(ranking.recommendedId).toBeNull();
  });
});

describe("negotiation", () => {
  it("saves money inside the ceiling", () => {
    const n = vectors.negotiation;
    const r = negotiationSaving(n.qty, n.fromRate, n.toRate, n.ceiling);
    expect(r.saved).toBe(n.expected.saved);
    expect(r.withinCeiling).toBe(n.expected.withinCeiling);
  });
});

describe("Loss Guard", () => {
  const { input, expected } = vectors.lossGuard;
  const r = lossGuard(input);
  const line = (k: string) => r.lines.find((l) => l.key === k)!.amount;

  it("builds the cost line by line", () => {
    expect(r.materialKg).toBeCloseTo(expected.materialKg, TOL);
    for (const k of ["material", "machine", "labour", "outside", "overhead", "packing", "finance"]) {
      expect(line(k)).toBeCloseTo(expected[k], TOL);
    }
  });

  it("totals and blocks the losing quote", () => {
    expect(r.totalCost).toBeCloseTo(expected.totalCost, TOL);
    expect(r.costPerPiece).toBeCloseTo(expected.costPerPiece, TOL);
    expect(r.quoteTotal).toBeCloseTo(expected.quoteTotal, TOL);
    expect(r.profit).toBeCloseTo(expected.profit, TOL);
    expect(r.minSafePerPiece).toBeCloseTo(expected.minSafePerPiece, TOL);
    expect(r.verdict).toBe(expected.verdict);
  });

  it("does not break on zero quantity", () => {
    const z = lossGuard({ ...input, quantity: 0 });
    expect(Number.isFinite(z.costPerPiece)).toBe(true);
  });
});

describe("savings", () => {
  it("matches the worked example", () => {
    const { input, expected } = vectors.savings;
    const r = savings(input);
    expect(r.materialSpend).toBeCloseTo(expected.materialSpend, TOL);
    expect(r.materialSaving).toBeCloseTo(expected.materialSaving, TOL);
    expect(r.lossSaving).toBeCloseTo(expected.lossSaving, TOL);
    expect(r.total).toBeCloseTo(expected.total, TOL);
  });
});
