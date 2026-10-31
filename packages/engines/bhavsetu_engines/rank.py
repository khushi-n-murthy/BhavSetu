"""Rank suppliers on effective cost (landed cost + expected delay cost).

A supplier whose promised date is after the need-by date is shown but never
recommended.
"""

from dataclasses import dataclass
from datetime import date

from .delay_risk import DelayRisk, delay_risk, need_by_date
from .landed_cost import LandedCost, landed_cost


@dataclass(frozen=True)
class Quote:
    id: str
    qty: float
    rate: float
    freight: float
    loading: float
    credit_days: float
    promised: date
    on_time: float
    slip_days: float


@dataclass(frozen=True)
class Context:
    customer_date: date
    production_days: int
    buffer_days: int
    cost_per_day_delay: float
    cost_of_capital: float
    gst_rate: float
    itc_claimable: bool


@dataclass(frozen=True)
class Row:
    quote: Quote
    cost: LandedCost
    risk: DelayRisk
    effective: float


@dataclass(frozen=True)
class Ranking:
    need_by: date
    rows: list[Row]
    recommended_id: str | None


def score(q: Quote, ctx: Context, need_by: date) -> Row:
    cost = landed_cost(
        qty=q.qty,
        rate=q.rate,
        freight=q.freight,
        loading=q.loading,
        credit_days=q.credit_days,
        gst_rate=ctx.gst_rate,
        itc_claimable=ctx.itc_claimable,
        cost_of_capital=ctx.cost_of_capital,
    )
    risk = delay_risk(
        need_by=need_by,
        promised=q.promised,
        on_time=q.on_time,
        slip_days=q.slip_days,
        cost_per_day=ctx.cost_per_day_delay,
    )
    return Row(q, cost, risk, cost.landed + risk.delay_cost)


def rank_suppliers(quotes: list[Quote], ctx: Context) -> Ranking:
    need_by = need_by_date(ctx.customer_date, ctx.production_days, ctx.buffer_days)
    rows = [score(q, ctx, need_by) for q in quotes]
    eligible = sorted((r for r in rows if not r.risk.misses_deadline), key=lambda r: r.effective)
    missers = sorted((r for r in rows if r.risk.misses_deadline), key=lambda r: r.effective)
    best = eligible[0].quote.id if eligible else None
    return Ranking(need_by, eligible + missers, best)
