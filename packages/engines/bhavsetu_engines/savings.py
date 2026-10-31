"""Illustrative savings and negotiation maths."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Savings:
    material_spend: float
    material_saving: float
    loss_saving: float
    total: float


def savings(
    *, turnover: float, material_share: float, saving_pct: float, losses_avoided: float, avg_loss: float
) -> Savings:
    spend = turnover * material_share
    material_saving = spend * saving_pct
    loss_saving = losses_avoided * avg_loss
    return Savings(spend, material_saving, loss_saving, material_saving + loss_saving)


def negotiation_saving(qty: float, from_rate: float, to_rate: float, ceiling: float) -> tuple[float, bool]:
    """Rupees saved by a counter-offer, and whether it stays inside the owner's ceiling."""
    return qty * (from_rate - to_rate), to_rate <= ceiling
