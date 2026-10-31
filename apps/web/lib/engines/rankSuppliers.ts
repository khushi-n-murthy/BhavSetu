import { landedCost, type LandedCostResult } from "./landedCost";
import { delayRisk, needByDate, type DelayRiskResult } from "./delayRisk";
import { formatINR } from "./format";

export interface SupplierQuote {
  id: string;
  name: string;
  qty: number;
  rate: number;
  freight: number;
  loading: number;
  creditDays: number;
  promised: string;
  onTime: number;
  slipDays: number;
}

export interface RankingContext {
  customerDate: string;
  productionDays: number;
  bufferDays: number;
  costPerDayDelay: number;
  costOfCapital: number;
  gstRate: number;
  itcClaimable: boolean;
}

export interface RankedRow {
  quote: SupplierQuote;
  cost: LandedCostResult;
  risk: DelayRiskResult;
  effective: number;
  recommended: boolean;
}

export interface Ranking {
  needBy: string;
  rows: RankedRow[]; // sorted: eligible by effective cost, then deadline-missers
  recommendedId: string | null;
  explanation: string;
}

export function scoreSupplier(q: SupplierQuote, ctx: RankingContext, needBy: string) {
  const cost = landedCost({
    qty: q.qty,
    rate: q.rate,
    freight: q.freight,
    loading: q.loading,
    creditDays: q.creditDays,
    gstRate: ctx.gstRate,
    itcClaimable: ctx.itcClaimable,
    costOfCapital: ctx.costOfCapital,
  });
  const risk = delayRisk({
    needBy,
    promised: q.promised,
    onTime: q.onTime,
    slipDays: q.slipDays,
    costPerDay: ctx.costPerDayDelay,
  });
  return { cost, risk, effective: cost.landed + risk.delayCost };
}

/**
 * Rank on effective cost (landed + expected delay cost). A supplier whose promised
 * date is after the need-by date is shown but never recommended.
 */
export function rankSuppliers(quotes: SupplierQuote[], ctx: RankingContext): Ranking {
  const needBy = needByDate(ctx.customerDate, ctx.productionDays, ctx.bufferDays);
  const scored = quotes.map((quote) => ({ quote, ...scoreSupplier(quote, ctx, needBy), recommended: false }));

  const eligible = scored.filter((r) => !r.risk.missesDeadline).sort((a, b) => a.effective - b.effective);
  const missers = scored.filter((r) => r.risk.missesDeadline).sort((a, b) => a.effective - b.effective);
  const rows = [...eligible, ...missers];

  const best = eligible[0] ?? null;
  if (best) best.recommended = true;

  return { needBy, rows, recommendedId: best?.quote.id ?? null, explanation: explain(best, scored) };
}

function explain(best: RankedRow | null, all: RankedRow[]): string {
  if (!best) {
    return "Every supplier arrives after the need-by date. Ask for earlier dispatch or split the order.";
  }
  const name = best.quote.name;
  const cheapest = [...all].sort((a, b) => a.cost.landed - b.cost.landed)[0];
  if (cheapest.quote.id === best.quote.id) {
    return `${name} has the lowest landed cost and arrives in time, so it is the clear pick.`;
  }
  const parts: string[] = [];
  // Cheapest on paper but late even when on time
  if (cheapest.risk.missesDeadline) {
    const late = -cheapest.risk.slackDays;
    parts.push(
      `${cheapest.quote.name} is cheapest on paper but arrives ${late} day${late === 1 ? "" : "s"} after the need-by date, so it is not recommended.`,
    );
  }
  // Cheapest on-time rival that loses on delay risk
  const rival = all
    .filter((r) => r.quote.id !== best.quote.id && !r.risk.missesDeadline && r.cost.landed < best.cost.landed)
    .sort((a, b) => a.cost.landed - b.cost.landed)[0];
  if (rival) {
    const extra = best.cost.landed - rival.cost.landed;
    parts.push(
      `${name} costs ${formatINR(extra)} more than ${rival.quote.name}, but ${rival.quote.name}'s delay risk is worth about ${formatINR(rival.risk.delayCost)} on this order.`,
    );
  }
  if (parts.length === 0) {
    parts.push(`${name} has the lowest effective cost once delay risk is counted.`);
  }
  return parts.join(" ");
}
