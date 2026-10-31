// Illustrative annual savings, based on the assumptions the visitor sets.

export interface SavingsInput {
  turnover: number; // ₹ a year
  materialShare: number; // material as a share of sales
  savingPct: number; // expected saving on material
  lossesAvoided: number; // loss-making orders avoided per year
  avgLoss: number; // ₹ average loss per such order
}

export interface SavingsResult {
  materialSpend: number;
  materialSaving: number;
  lossSaving: number;
  total: number;
}

export function savings(i: SavingsInput): SavingsResult {
  const materialSpend = i.turnover * i.materialShare;
  const materialSaving = materialSpend * i.savingPct;
  const lossSaving = i.lossesAvoided * i.avgLoss;
  return { materialSpend, materialSaving, lossSaving, total: materialSaving + lossSaving };
}

export interface NegotiationResult {
  saved: number;
  withinCeiling: boolean;
}

/** A counter-offer is only valid inside the owner's ceiling. */
export function negotiationSaving(qty: number, fromRate: number, toRate: number, ceiling: number): NegotiationResult {
  return { saved: qty * (fromRate - toRate), withinCeiling: toRate <= ceiling };
}
