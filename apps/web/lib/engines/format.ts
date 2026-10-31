// Display rule: keep full precision in code; show rupees rounded to the nearest
// rupee with Indian digit grouping. Per-piece prices may show paise.

const inr0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatINR(n: number): string {
  const v = Math.round(n);
  return `${v < 0 ? "−" : ""}₹${inr0.format(Math.abs(v))}`;
}

export function formatINRPaise(n: number): string {
  const v = Math.round(n * 100) / 100;
  return `${v < 0 ? "−" : ""}₹${inr2.format(Math.abs(v))}`;
}

export function formatNumber(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(n);
}

export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]}`;
}
