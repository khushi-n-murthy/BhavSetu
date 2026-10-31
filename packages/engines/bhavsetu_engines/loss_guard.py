"""Loss Guard: a job's full cost, line by line, and a verdict on the quote."""

from dataclasses import dataclass


@dataclass(frozen=True)
class LossGuardResult:
    material_kg: float
    lines: dict[str, float]
    total_cost: float
    cost_per_piece: float
    quote_total: float
    profit: float
    margin_on_cost: float
    min_safe_per_piece: float
    verdict: str  # "loss" | "thin" | "safe"


def loss_guard(
    *,
    quantity: float,
    net_kg_per_piece: float,
    scrap_pct: float,
    material_rate: float,
    machine_hours: float,
    machine_rate: float,
    labour_hours: float,
    labour_rate: float,
    outside_per_piece: float,
    overhead_pct: float,
    packing_delivery: float,
    payment_days: float,
    cost_of_capital: float,
    min_margin: float,
    quoted_per_piece: float,
) -> LossGuardResult:
    material_kg = quantity * net_kg_per_piece * (1 + scrap_pct)
    material = material_kg * material_rate
    machine = machine_hours * machine_rate
    labour = labour_hours * labour_rate
    outside = quantity * outside_per_piece
    overhead = overhead_pct * (material + machine + labour + outside)
    packing = packing_delivery
    before_finance = material + machine + labour + outside + overhead + packing
    finance = before_finance * cost_of_capital * (payment_days / 365)
    total_cost = before_finance + finance

    cost_per_piece = total_cost / quantity if quantity else 0.0
    quote_total = quantity * quoted_per_piece
    profit = quote_total - total_cost
    margin = profit / total_cost if total_cost else 0.0
    min_safe = cost_per_piece * (1 + min_margin)

    if profit < 0:
        verdict = "loss"
    elif margin < min_margin:
        verdict = "thin"
    else:
        verdict = "safe"

    lines = {
        "material": material,
        "machine": machine,
        "labour": labour,
        "outside": outside,
        "overhead": overhead,
        "packing": packing,
        "finance": finance,
    }
    return LossGuardResult(
        material_kg, lines, total_cost, cost_per_piece, quote_total, profit, margin, min_safe, verdict
    )
