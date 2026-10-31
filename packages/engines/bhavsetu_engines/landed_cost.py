"""Landed cost of a supplier quote.

Landed = q·p + freight + loading + (no ITC ? g·q·p : 0) − q·p·r·(credit days / 365)
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class LandedCost:
    material: float
    freight: float
    loading: float
    gst_cost: float
    credit_benefit: float
    landed: float


def landed_cost(
    *,
    qty: float,
    rate: float,
    freight: float,
    loading: float,
    credit_days: float,
    gst_rate: float,
    itc_claimable: bool,
    cost_of_capital: float,
) -> LandedCost:
    material = qty * rate
    gst_cost = 0.0 if itc_claimable else gst_rate * material
    credit_benefit = material * cost_of_capital * (credit_days / 365)
    landed = material + freight + loading + gst_cost - credit_benefit
    return LandedCost(material, freight, loading, gst_cost, credit_benefit, landed)
