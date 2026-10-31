"""Engine tests driven by the shared vectors in tests/vectors.json."""

import json
from datetime import date
from pathlib import Path

import pytest

from bhavsetu_engines import (
    delay_risk,
    landed_cost,
    loss_guard,
    need_by_date,
    negotiation_saving,
    savings,
)
from bhavsetu_engines.rank import Context, Quote, rank_suppliers

VECTORS = json.loads((Path(__file__).resolve().parents[3] / "tests" / "vectors.json").read_text())
SV = VECTORS["supplier"]
CTX = SV["context"]
NEED_BY = date.fromisoformat(SV["expectedNeedBy"])
approx = lambda x: pytest.approx(x, abs=0.01)  # noqa: E731


def context() -> Context:
    return Context(
        customer_date=date.fromisoformat(CTX["customerDate"]),
        production_days=CTX["productionDays"],
        buffer_days=CTX["bufferDays"],
        cost_per_day_delay=CTX["costPerDayDelay"],
        cost_of_capital=CTX["costOfCapital"],
        gst_rate=CTX["gstRate"],
        itc_claimable=CTX["itcClaimable"],
    )


def quote(case: dict) -> Quote:
    q = case["quote"]
    return Quote(
        id=case["id"],
        qty=q["qty"],
        rate=q["rate"],
        freight=q["freight"],
        loading=q["loading"],
        credit_days=q["creditDays"],
        promised=date.fromisoformat(q["promised"]),
        on_time=q["onTime"],
        slip_days=q["slipDays"],
    )


def test_need_by():
    assert need_by_date(date.fromisoformat(CTX["customerDate"]), CTX["productionDays"], CTX["bufferDays"]) == NEED_BY


@pytest.mark.parametrize("case", SV["cases"], ids=[c["id"] for c in SV["cases"]])
def test_landed_and_delay(case):
    q = case["quote"]
    exp = case["expected"]
    cost = landed_cost(
        qty=q["qty"],
        rate=q["rate"],
        freight=q["freight"],
        loading=q["loading"],
        credit_days=q["creditDays"],
        gst_rate=CTX["gstRate"],
        itc_claimable=case.get("itcClaimable", CTX["itcClaimable"]),
        cost_of_capital=CTX["costOfCapital"],
    )
    risk = delay_risk(
        need_by=NEED_BY,
        promised=date.fromisoformat(q["promised"]),
        on_time=q["onTime"],
        slip_days=q["slipDays"],
        cost_per_day=CTX["costPerDayDelay"],
    )
    assert cost.landed == approx(exp["landed"])
    assert risk.delay_days == approx(exp["delayDays"])
    assert risk.delay_cost == approx(exp["delayCost"])
    assert cost.landed + risk.delay_cost == approx(exp["effective"])
    assert risk.misses_deadline is exp["missesDeadline"]


@pytest.mark.parametrize("r", SV["rankings"], ids=lambda r: "+".join(r["ids"]))
def test_ranking(r):
    by_id = {c["id"]: quote(c) for c in SV["cases"]}
    ranking = rank_suppliers([by_id[i] for i in r["ids"]], context())
    assert ranking.recommended_id == r["recommended"]
    assert [row.quote.id for row in ranking.rows] == r["order"]


def test_negotiation():
    n = VECTORS["negotiation"]
    saved, ok = negotiation_saving(n["qty"], n["fromRate"], n["toRate"], n["ceiling"])
    assert saved == n["expected"]["saved"]
    assert ok is n["expected"]["withinCeiling"]


def test_loss_guard():
    i = VECTORS["lossGuard"]["input"]
    exp = VECTORS["lossGuard"]["expected"]
    r = loss_guard(
        quantity=i["quantity"],
        net_kg_per_piece=i["netKgPerPiece"],
        scrap_pct=i["scrapPct"],
        material_rate=i["materialRate"],
        machine_hours=i["machineHours"],
        machine_rate=i["machineRate"],
        labour_hours=i["labourHours"],
        labour_rate=i["labourRate"],
        outside_per_piece=i["outsidePerPiece"],
        overhead_pct=i["overheadPct"],
        packing_delivery=i["packingDelivery"],
        payment_days=i["paymentDays"],
        cost_of_capital=i["costOfCapital"],
        min_margin=i["minMargin"],
        quoted_per_piece=i["quotedPerPiece"],
    )
    assert r.material_kg == approx(exp["materialKg"])
    for key in ["material", "machine", "labour", "outside", "overhead", "packing", "finance"]:
        assert r.lines[key] == approx(exp[key]), key
    assert r.total_cost == approx(exp["totalCost"])
    assert r.cost_per_piece == approx(exp["costPerPiece"])
    assert r.quote_total == approx(exp["quoteTotal"])
    assert r.profit == approx(exp["profit"])
    assert r.min_safe_per_piece == approx(exp["minSafePerPiece"])
    assert r.verdict == exp["verdict"]


def test_savings():
    i = VECTORS["savings"]["input"]
    exp = VECTORS["savings"]["expected"]
    r = savings(
        turnover=i["turnover"],
        material_share=i["materialShare"],
        saving_pct=i["savingPct"],
        losses_avoided=i["lossesAvoided"],
        avg_loss=i["avgLoss"],
    )
    assert r.material_spend == approx(exp["materialSpend"])
    assert r.material_saving == approx(exp["materialSaving"])
    assert r.loss_saving == approx(exp["lossSaving"])
    assert r.total == approx(exp["total"])
