// Landed cost of a supplier quote.
// Landed = q·p + freight + loading + (no ITC ? g·q·p : 0) − q·p·r·(credit days / 365)

export interface LandedCostInput {
  qty: number; // tonnes
  rate: number; // ₹ per tonne, ex-GST
  freight: number; // ₹ for the whole lot
  loading: number; // ₹ for the whole lot
  creditDays: number; // days of supplier credit
  gstRate: number; // e.g. 0.18
  itcClaimable: boolean; // can the unit claim GST input tax credit?
  costOfCapital: number; // annual, e.g. 0.14
}

export interface LandedCostResult {
  material: number;
  freight: number;
  loading: number;
  gstCost: number;
  creditBenefit: number;
  landed: number;
}

export function landedCost(i: LandedCostInput): LandedCostResult {
  const material = i.qty * i.rate;
  const gstCost = i.itcClaimable ? 0 : i.gstRate * material;
  const creditBenefit = material * i.costOfCapital * (i.creditDays / 365);
  const landed = material + i.freight + i.loading + gstCost - creditBenefit;
  return { material, freight: i.freight, loading: i.loading, gstCost, creditBenefit, landed };
}
