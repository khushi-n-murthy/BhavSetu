// Loss Guard: builds a job's full cost line by line and blocks any quote below cost.

export interface LossGuardInput {
  quantity: number; // pieces
  netKgPerPiece: number;
  scrapPct: number; // 0.08 = 8%
  materialRate: number; // ₹ per kg
  machineHours: number;
  machineRate: number; // ₹ per hour
  labourHours: number;
  labourRate: number; // ₹ per hour
  outsidePerPiece: number; // outside processing, ₹ per piece
  overheadPct: number; // on material + machine + labour + outside
  packingDelivery: number; // ₹ for the job
  paymentDays: number; // buyer's payment terms
  costOfCapital: number; // annual
  minMargin: number; // on cost, 0.08 = 8%
  quotedPerPiece: number;
}

export interface CostLine {
  key: string;
  label: string;
  detail: string;
  amount: number;
}

export type Verdict = "loss" | "thin" | "safe";

export interface LossGuardResult {
  materialKg: number;
  lines: CostLine[];
  totalCost: number;
  costPerPiece: number;
  quoteTotal: number;
  profit: number;
  marginOnCost: number;
  minSafePerPiece: number;
  verdict: Verdict;
}

const fmt = (n: number, d = 0) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: d }).format(n);

export function lossGuard(i: LossGuardInput): LossGuardResult {
  const materialKg = i.quantity * i.netKgPerPiece * (1 + i.scrapPct);
  const material = materialKg * i.materialRate;
  const machine = i.machineHours * i.machineRate;
  const labour = i.labourHours * i.labourRate;
  const outside = i.quantity * i.outsidePerPiece;
  const overhead = i.overheadPct * (material + machine + labour + outside);
  const packing = i.packingDelivery;
  const beforeFinance = material + machine + labour + outside + overhead + packing;
  const finance = beforeFinance * i.costOfCapital * (i.paymentDays / 365);
  const totalCost = beforeFinance + finance;

  const lines: CostLine[] = [
    { key: "material", label: "Material", detail: `${fmt(materialKg, 1)} kg (incl. ${fmt(i.scrapPct * 100, 1)}% scrap) × ₹${fmt(i.materialRate, 2)}`, amount: material },
    { key: "machine", label: "Machine time", detail: `${fmt(i.machineHours, 1)} h × ₹${fmt(i.machineRate)}`, amount: machine },
    { key: "labour", label: "Labour", detail: `${fmt(i.labourHours, 1)} h × ₹${fmt(i.labourRate)}`, amount: labour },
    { key: "outside", label: "Outside processing", detail: `${fmt(i.quantity)} × ₹${fmt(i.outsidePerPiece, 2)}`, amount: outside },
    { key: "overhead", label: "Overhead", detail: `${fmt(i.overheadPct * 100, 1)}% of the lines above`, amount: overhead },
    { key: "packing", label: "Packing and delivery", detail: "for the whole job", amount: packing },
    { key: "finance", label: "Finance cost", detail: `waiting ${fmt(i.paymentDays)} days for payment at ${fmt(i.costOfCapital * 100, 1)}% a year`, amount: finance },
  ];

  const costPerPiece = i.quantity > 0 ? totalCost / i.quantity : 0;
  const quoteTotal = i.quantity * i.quotedPerPiece;
  const profit = quoteTotal - totalCost;
  const marginOnCost = totalCost > 0 ? profit / totalCost : 0;
  const minSafePerPiece = costPerPiece * (1 + i.minMargin);

  let verdict: Verdict = "safe";
  if (profit < 0) verdict = "loss";
  else if (marginOnCost < i.minMargin) verdict = "thin";

  return { materialKg, lines, totalCost, costPerPiece, quoteTotal, profit, marginOnCost, minSafePerPiece, verdict };
}
