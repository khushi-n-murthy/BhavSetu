import { addDays, daysBetween } from "./dates";

// Need-by = customer date − production days − buffer
export function needByDate(customerDate: string, productionDays: number, bufferDays: number): string {
  return addDays(customerDate, -(productionDays + bufferDays));
}

export interface DelayRiskInput {
  needBy: string; // ISO date
  promised: string; // ISO date the supplier promises delivery
  onTime: number; // share of on-time deliveries, 0–1
  slipDays: number; // typical slip when late
  costPerDay: number; // ₹ cost of one day's delay
}

export interface DelayRiskResult {
  slackDays: number; // s = need-by − promised
  missesDeadline: boolean; // late even if on time
  delayDays: number; // expected days late
  delayCost: number;
}

// Delay days = −s + (1 − on-time)·slip                 if s < 0
//            = (1 − on-time)·max(0, slip − s)          if s ≥ 0
export function delayRisk(i: DelayRiskInput): DelayRiskResult {
  const s = daysBetween(i.promised, i.needBy);
  const pLate = 1 - i.onTime;
  const delayDays = s < 0 ? -s + pLate * i.slipDays : pLate * Math.max(0, i.slipDays - s);
  return {
    slackDays: s,
    missesDeadline: s < 0,
    delayDays,
    delayCost: delayDays * i.costPerDay,
  };
}
