"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LangSwitch, langTag, useLang } from "./LanguageProvider";
import { fill, pick, type Lang, type LocalText, type MaybeLocal } from "@/lib/i18n";
import type { ChatMsg, DemoScript, TraceEvent } from "@/lib/content";

export interface SimTableRow {
  id: string;
  name: string;
  landed: string;
  arrival: string;
  delayCost: string;
  effective: string;
  status: "recommended" | "late" | "risk";
}

export interface SimPO {
  number: string;
  supplier: string;
  item: string;
  rate: string;
  landed: string;
  delivery: string;
  forOrder: string;
}

interface Props {
  script: DemoScript;
  vars: Record<string, string>;
  suppliers: { id: string; name: string }[];
  table: { rows: SimTableRow[]; explanation: string };
  po: SimPO;
}

const STEP_TITLES = [
  "Owner's voice note",
  "Plan from case memory",
  "RFQs in each supplier's language",
  "Replies in any format",
  "Unclear field confirmed",
  "Ranked on effective cost",
  "Counter-offer inside the ceiling",
  "Owner approves",
];

const LANG_TAGS: Record<string, string> = { Tamil: "ta", Kannada: "kn", Hindi: "hi", English: "en-IN" };

export function PurchaseSimulator({ script, vars, suppliers, table, po }: Props) {
  const { lang } = useLang();
  const total = script.beats.length;
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [decision, setDecision] = useState<null | "approve" | "change" | "reject">(null);
  const [tab, setTab] = useState<"chat" | "trace">("chat");
  const chatRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<HTMLOListElement>(null);

  const done = shown >= total;
  const nameOf = useCallback((id?: string) => suppliers.find((s) => s.id === id)?.name ?? id ?? "", [suppliers]);
  const tx = useCallback((t: MaybeLocal | undefined) => fill(pick(t, lang), vars), [lang, vars]);

  // Auto-advance every 1.5–2.5 s; stops at the approval step, which needs a person.
  useEffect(() => {
    if (!playing) return;
    if (done) {
      setPlaying(false);
      return;
    }
    const delay = shown === 0 ? 400 : 1500 + (shown % 3) * 500;
    const id = window.setTimeout(() => setShown((s) => Math.min(s + 1, total)), delay);
    return () => window.clearTimeout(id);
  }, [playing, shown, done, total]);

  // Keep the newest message in view without scrolling the page.
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    const tr = traceRef.current;
    if (tr) tr.scrollTo({ top: tr.scrollHeight, behavior: "smooth" });
  }, [shown, decision, tab]);

  const restart = () => {
    setPlaying(false);
    setShown(0);
    setDecision(null);
  };

  const visible = script.beats.slice(0, shown);
  const current = visible.at(-1);
  const traceItems: { step: number; ev: TraceEvent }[] = visible.flatMap((b) => b.trace.map((ev) => ({ step: b.step, ev })));
  if (decision === "approve") traceItems.push(...script.afterApprove.map((ev) => ({ step: 8, ev })));

  const statusText = current ? `Step ${current.step} of 8: ${STEP_TITLES[current.step - 1]}` : "Ready. Press Play or Next.";

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => (done ? (restart(), setPlaying(true)) : setPlaying((p) => !p))}
          aria-pressed={playing}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
          {playing ? "Pause" : done ? "Play again" : shown === 0 ? "Play" : "Resume"}
        </button>
        <button type="button" className="btn" onClick={() => setShown((s) => Math.min(s + 1, total))} disabled={done}>
          Next
        </button>
        <button type="button" className="btn" onClick={restart} disabled={shown === 0}>
          Restart
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-sm text-muted sm:inline">Owner speaks</span>
          <LangSwitch label="Owner's language in the demo" compact />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-caution/30 bg-caution-soft px-3 py-2 text-sm">
        <span className="font-semibold text-caution">Simulation with sample data</span>
        <span className="text-ink-soft" aria-live="polite">
          {statusText}
        </span>
      </div>

      {/* Mobile tabs */}
      <div role="tablist" aria-label="Simulator view" className="mt-4 grid grid-cols-2 rounded-full border border-line p-0.5 md:hidden">
        {(["chat", "trace"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            aria-controls={`sim-${k}`}
            onClick={() => setTab(k)}
            className={`min-h-[40px] rounded-full text-sm font-semibold ${tab === k ? "bg-ink text-white" : "text-ink-soft"}`}
          >
            {k === "chat" ? "WhatsApp" : `Agent trace (${traceItems.length})`}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Phone */}
        <div id="sim-chat" role="tabpanel" className={`${tab === "chat" ? "block" : "hidden"} md:block`}>
          <div className="mx-auto max-w-[420px] overflow-hidden rounded-[2rem] border-[10px] border-ink bg-chat shadow-[0_18px_40px_-20px_rgba(16,33,63,.45)]">
            <div className="flex items-center gap-3 bg-ink px-4 py-3 text-white">
              <span aria-hidden className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold">
                भा
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold leading-tight">BhavSetu · case 1042</p>
                <p className="truncate text-xs text-white/75">{script.order.customer} order · 2 t MS sheet</p>
              </div>
            </div>
            <div ref={chatRef} className="h-[30rem] space-y-3 overflow-y-auto px-3 py-4" aria-label="Simulated WhatsApp conversation">
              {shown === 0 && (
                <div className="grid h-full place-items-center text-center text-sm text-muted">
                  <p className="max-w-[16rem]">
                    Press <strong>Play</strong> to watch one purchase, or <strong>Next</strong> to go step by step.
                  </p>
                </div>
              )}
              {visible.map((b, i) => (
                <Bubble
                  key={i}
                  msg={b.msg}
                  lang={lang}
                  tx={tx}
                  nameOf={nameOf}
                  table={table}
                  labels={script.labels}
                  decision={decision}
                  onDecide={setDecision}
                  po={po}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Trace */}
        <div id="sim-trace" role="tabpanel" className={`${tab === "trace" ? "block" : "hidden"} md:block`}>
          <div className="flex h-full flex-col rounded-2xl border border-line bg-paper">
            <div className="flex items-baseline justify-between border-b border-line px-4 py-3">
              <h3 className="font-semibold">Agent trace</h3>
              <span className="text-sm text-muted">what the agents did, in order</span>
            </div>
            <ol ref={traceRef} className="ledger max-h-[33rem] min-h-[16rem] flex-1 overflow-y-auto py-1 pl-3 pr-4 text-sm">
              {traceItems.length === 0 && <li className="py-2.5 text-muted">Nothing yet. The plan appears here before any message goes out.</li>}
              {traceItems.map(({ step, ev }, i) => (
                <li key={i} className="pop-in flex items-start gap-2 border-b border-line py-2.5 last:border-b-0">
                  <span className="num w-5 shrink-0 pt-0.5 text-right text-muted">{step}</span>
                  <AgentPill agent={ev.agent} />
                  <span className="min-w-0">
                    <span className="font-medium">{fill(ev.action, vars)}</span>
                    <span className={`block ${ev.warn || ev.recover ? "text-caution" : ev.gate ? "text-accent-strong" : "text-muted"}`}>
                      {ev.gate && <LockIcon />}
                      {tx(ev.detail)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <details className="mt-5 rounded-lg border border-line px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold">Read the full transcript</summary>
        <ol className="mt-3 space-y-2">
          {script.beats.map((b, i) => (
            <li key={i}>
              <span className="font-medium">
                Step {b.step}, {speaker(b.msg, nameOf)}:{" "}
              </span>
              {transcriptLine(b.msg, vars, table.explanation)}
            </li>
          ))}
          <li>
            <span className="font-medium">After Approve:</span> PO {po.number} issued to {po.supplier} at {po.rate} a ton, landed {po.landed},
            delivery {po.delivery}.
          </li>
        </ol>
      </details>
    </div>
  );
}

function speaker(m: ChatMsg, nameOf: (id?: string) => string) {
  if (m.from === "owner") return "owner";
  if (m.from === "bhavsetu") return m.to === "owner" ? "BhavSetu to the owner" : `BhavSetu to ${nameOf(m.to)}`;
  return nameOf(m.from);
}

function transcriptLine(m: ChatMsg, vars: Record<string, string>, explanation: string) {
  if (m.kind === "table") return `Ranked table. ${explanation}`;
  if (m.kind === "slip") return `Photo of a handwritten rate slip: ${m.slip?.join(", ")}.`;
  const en = pick(m.text, "en");
  const sub = typeof m.sub === "string" ? m.sub : undefined;
  return fill(sub && m.lang !== "English" ? `${en} (${sub})` : en, vars);
}

function Bubble({
  msg,
  lang,
  tx,
  nameOf,
  table,
  labels,
  decision,
  onDecide,
  po,
}: {
  msg: ChatMsg;
  lang: Lang;
  tx: (t: MaybeLocal | undefined) => string;
  nameOf: (id?: string) => string;
  table: Props["table"];
  labels: DemoScript["labels"];
  decision: null | "approve" | "change" | "reject";
  onDecide: (d: "approve" | "change" | "reject") => void;
  po: SimPO;
}) {
  const fromOwner = msg.from === "owner";
  const fromBot = msg.from === "bhavsetu";
  const ownerFacing = fromOwner || msg.to === "owner";
  const textLang = ownerFacing ? langTag(lang) : LANG_TAGS[msg.lang ?? "English"];
  const subtitle = ownerFacing
    ? lang !== "en" && msg.sub && typeof msg.sub !== "string"
      ? tx(msg.sub[lang as "kn" | "hi"])
      : ""
    : typeof msg.sub === "string"
      ? tx(msg.sub)
      : "";

  const label = fromOwner ? "You (owner)" : fromBot ? (msg.to === "owner" ? "BhavSetu" : `BhavSetu → ${nameOf(msg.to)}`) : nameOf(msg.from);

  const align = fromOwner ? "ml-auto bg-bubble-out" : "mr-auto bg-paper";
  const width = msg.kind === "table" || msg.kind === "approval" ? "w-full" : "max-w-[86%]";

  return (
    <div className={`pop-in ${width} ${align} rounded-xl px-3 py-2 shadow-[0_1px_0_rgba(16,33,63,.12)]`}>
      <p className={`text-xs font-semibold ${fromBot ? "text-accent-strong" : fromOwner ? "text-ink-soft" : "text-[#7a3e9d]"}`}>
        {label}
        {msg.lang && !ownerFacing && msg.lang !== "English" ? <span className="font-normal text-muted"> · {msg.lang}</span> : null}
      </p>

      {msg.kind === "voice" && <VoiceBar duration={msg.duration} />}

      {(msg.kind === "text" || msg.kind === "voice" || msg.kind === "approval") && (
        <>
          {msg.kind === "approval" && <VoiceBar duration={msg.duration} />}
          <p lang={textLang} className={`mt-1 text-[0.95rem] ${msg.kind !== "text" ? "italic text-ink-soft" : ""}`}>
            {tx(msg.text)}
          </p>
          {subtitle && <p className="mt-1 border-t border-line pt-1 text-xs text-muted">{subtitle}</p>}
        </>
      )}

      {msg.kind === "slip" && (
        <figure className="mt-2">
          <div className="slip mx-1 my-2 rounded-sm px-4 py-3 text-[1.05rem] leading-snug" aria-label="Photo of a handwritten rate slip">
            {msg.slip?.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <figcaption className="text-xs text-muted">Photo of a handwritten rate slip</figcaption>
        </figure>
      )}

      {msg.kind === "table" && <RankTable table={table} />}

      {msg.kind === "approval" && (
        <div className="mt-3">
          {decision === null && (
            <div className="grid grid-cols-3 gap-2">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onDecide("approve")} lang={langTag(lang)}>
                {labels.approve[lang as keyof LocalText]}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onDecide("change")} lang={langTag(lang)}>
                {labels.change[lang as keyof LocalText]}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onDecide("reject")} lang={langTag(lang)}>
                {labels.reject[lang as keyof LocalText]}
              </button>
            </div>
          )}
          {decision === "approve" && <POCard po={po} />}
          {(decision === "change" || decision === "reject") && (
            <div className="rounded-lg bg-surface p-3 text-sm">
              <p>
                {decision === "change"
                  ? "In the product the owner says what to change, such as quantity, supplier or date, and the agents redo the plan."
                  : "Nothing is ordered. The case stays open in memory and the suppliers are told politely that the order is on hold."}
              </p>
              <button type="button" className="link mt-2 font-semibold" onClick={() => onDecide("approve")}>
                Approve instead to see the purchase order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RankTable({ table }: { table: Props["table"] }) {
  return (
    <div className="mt-2">
      <div className="overflow-x-auto">
        <table className="num w-full min-w-[19rem] text-left text-xs">
          <caption className="sr-only">Suppliers ranked by effective cost</caption>
          <thead className="text-muted">
            <tr>
              <th scope="col" className="py-1 pr-2 font-medium">
                Supplier
              </th>
              <th scope="col" className="py-1 pr-2 text-right font-medium">
                Landed
              </th>
              <th scope="col" className="py-1 pr-2 font-medium">
                Arrives
              </th>
              <th scope="col" className="py-1 pr-2 text-right font-medium">
                Delay risk
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Effective
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r) => (
              <tr key={r.id} className={`border-t border-line ${r.status === "recommended" ? "bg-accent-soft" : ""}`}>
                <th scope="row" className="py-1.5 pr-2 font-semibold">
                  {r.name}
                  <span className={`block text-[0.7rem] font-semibold ${r.status === "recommended" ? "text-accent-strong" : r.status === "late" ? "text-loss" : "text-muted"}`}>
                    {r.status === "recommended" ? "Recommended" : r.status === "late" ? "Misses deadline" : "Delay risk"}
                  </span>
                </th>
                <td className="py-1.5 pr-2 text-right">{r.landed}</td>
                <td className={`py-1.5 pr-2 ${r.status === "late" ? "text-loss" : ""}`}>{r.arrival}</td>
                <td className={`py-1.5 pr-2 text-right ${r.status !== "recommended" ? "text-loss" : ""}`}>{r.delayCost}</td>
                <td className="py-1.5 text-right font-semibold">{r.effective}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm">{table.explanation}</p>
    </div>
  );
}

function POCard({ po }: { po: SimPO }) {
  return (
    <div className="pop-in rounded-lg border-2 border-accent bg-paper p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-bold">Purchase order {po.number}</p>
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">Approved by owner</span>
      </div>
      <dl className="num mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-muted">Supplier</dt>
        <dd>{po.supplier}</dd>
        <dt className="text-muted">Item</dt>
        <dd>{po.item}</dd>
        <dt className="text-muted">Rate</dt>
        <dd>{po.rate} a ton, GST extra</dd>
        <dt className="text-muted">Landed cost</dt>
        <dd className="font-semibold">{po.landed}</dd>
        <dt className="text-muted">Delivery</dt>
        <dd>{po.delivery}</dd>
        <dt className="text-muted">For</dt>
        <dd>{po.forOrder}</dd>
      </dl>
      <p className="mt-2 text-xs text-muted">Simulated: no real PO is sent from this page.</p>
    </div>
  );
}

function AgentPill({ agent }: { agent: string }) {
  const colors: Record<string, string> = {
    Munim: "bg-ink text-white",
    Kharid: "bg-accent text-white",
    Engines: "bg-surface text-ink ring-1 ring-line",
    Vision: "bg-[#efe7f6] text-[#5b2b7a]",
  };
  return (
    <span className={`mt-0.5 inline-block w-[4.6rem] shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${colors[agent] ?? "bg-surface"}`}>
      {agent}
    </span>
  );
}

function VoiceBar({ duration }: { duration?: string }) {
  const bars = [6, 12, 9, 16, 10, 14, 7, 12, 18, 9, 13, 6, 11, 15, 8, 12, 6, 10];
  return (
    <div className="mt-1 flex items-center gap-2" aria-label={`Voice note${duration ? `, ${duration}` : ""}`}>
      <span aria-hidden className="grid size-7 place-items-center rounded-full bg-accent text-white">
        <PlayIcon small />
      </span>
      <svg aria-hidden width="110" height="20" viewBox="0 0 110 20" className="text-ink-soft">
        {bars.map((h, i) => (
          <rect key={i} x={i * 6} y={(20 - h) / 2} width="3" height={h} rx="1.5" fill="currentColor" opacity={0.55} />
        ))}
      </svg>
      {duration && <span className="num text-xs text-muted">{duration}</span>}
    </div>
  );
}

function PlayIcon({ small = false }: { small?: boolean }) {
  const s = small ? 12 : 16;
  return (
    <svg aria-hidden width={s} height={s} viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5v11l9-5.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="mr-1 inline -translate-y-px">
      <path d="M5 7V5a3 3 0 1 1 6 0v2h.5A1.5 1.5 0 0 1 13 8.5v5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-5A1.5 1.5 0 0 1 4.5 7H5zm1.5 0h3V5a1.5 1.5 0 0 0-3 0v2z" />
    </svg>
  );
}
