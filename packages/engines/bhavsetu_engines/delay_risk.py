"""Delay risk against the customer's deadline.

Need-by    = customer date − production days − buffer
s          = need-by − promised
Delay days = −s + (1 − on-time)·slip            if s < 0
           = (1 − on-time)·max(0, slip − s)     if s ≥ 0
Delay cost = delay days × cost of one day's delay
"""

from dataclasses import dataclass
from datetime import date, timedelta


def need_by_date(customer_date: date, production_days: int, buffer_days: int) -> date:
    return customer_date - timedelta(days=production_days + buffer_days)


@dataclass(frozen=True)
class DelayRisk:
    slack_days: int
    misses_deadline: bool
    delay_days: float
    delay_cost: float


def delay_risk(
    *, need_by: date, promised: date, on_time: float, slip_days: float, cost_per_day: float
) -> DelayRisk:
    s = (need_by - promised).days
    p_late = 1 - on_time
    if s < 0:
        delay_days = -s + p_late * slip_days
    else:
        delay_days = p_late * max(0, slip_days - s)
    return DelayRisk(s, s < 0, delay_days, delay_days * cost_per_day)
