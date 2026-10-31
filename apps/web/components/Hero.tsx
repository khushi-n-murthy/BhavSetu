"use client";

import { LangSwitch, langTag, useLang } from "./LanguageProvider";
import type { LocalText } from "@/lib/i18n";

export interface HeroCopy {
  eyebrow: string;
  headline: LocalText;
  subhead: LocalText;
  buttons: { try: LocalText; github: LocalText; deck: LocalText; video: LocalText };
  trustLine: LocalText;
}

export interface PreviewRow {
  name: string;
  rate: string;
  landed: string;
  delay: string;
  effective: string;
  status: "recommended" | "late" | "risk";
  rateRank: number;
}

export function Hero({
  copy,
  links,
  preview,
  teamLine,
}: {
  copy: HeroCopy;
  links: { github: string; deck: string; demoVideo: string };
  preview: { rows: PreviewRow[]; needBy: string; explanation: string };
  teamLine: string;
}) {
  const { lang } = useLang();
  const t = (x: LocalText) => x[lang];
  const tag = langTag(lang);

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14 lg:pb-20 lg:pt-16">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">{copy.eyebrow}</p>
            <LangSwitch label="Language for the headline and the demo" />
          </div>

          <h1 lang={tag} className="mt-6 text-[2.15rem] font-bold leading-[1.1] sm:text-5xl lg:text-[3.4rem]">
            {t(copy.headline)}
          </h1>
          <p lang={tag} className="mt-5 max-w-[38rem] text-lg text-ink-soft">
            {t(copy.subhead)}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#demo" className="btn btn-primary" lang={tag}>
              {t(copy.buttons.try)}
            </a>
            {links.github && (
              <a href={links.github} className="btn" target="_blank" rel="noopener noreferrer">
                {t(copy.buttons.github)}
              </a>
            )}
            {links.deck && (
              <a href={links.deck} className="btn" target="_blank" rel="noopener noreferrer" lang={tag}>
                {t(copy.buttons.deck)}
              </a>
            )}
            {links.demoVideo && (
              <a href={links.demoVideo} className="btn" target="_blank" rel="noopener noreferrer" lang={tag}>
                {t(copy.buttons.video)}
              </a>
            )}
          </div>

          <p lang={tag} className="mt-6 text-sm text-muted">
            {t(copy.trustLine)}
          </p>
          {teamLine && <p className="mt-1 text-sm text-muted">{teamLine}</p>}
        </div>

        <ResultPreview {...preview} />
      </div>
    </section>
  );
}

/** The product's "aha", computed by the engines: the cheapest rate is not the best option. */
function ResultPreview({ rows, needBy, explanation }: { rows: PreviewRow[]; needBy: string; explanation: string }) {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">2 t of 2 mm MS sheet, needed by {needBy}</span>
        <span className="shrink-0 text-xs text-muted">sample data</span>
      </figcaption>
      <ol className="mt-4 space-y-2.5">
        {rows.map((r, i) => (
          <li
            key={r.name}
            className={`rounded-xl border bg-paper p-3 ${
              r.status === "recommended" ? "border-accent ring-1 ring-accent" : "border-line"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  <span className="num mr-2 text-muted">{i + 1}</span>
                  {r.name}
                </p>
                <p className="num text-sm text-muted">
                  Rate {r.rate}/t · {r.rateRank === 1 ? "cheapest rate" : r.rateRank === 2 ? "2nd cheapest rate" : "highest rate"}
                </p>
              </div>
              <StatusTag status={r.status} />
            </div>
            <dl className="num mt-2 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-muted">Landed</dt>
                <dd>{r.landed}</dd>
              </div>
              <div>
                <dt className="text-muted">Delay risk</dt>
                <dd className={r.status === "recommended" ? "" : "text-loss"}>{r.delay}</dd>
              </div>
              <div>
                <dt className="text-muted">Effective</dt>
                <dd className="font-semibold">{r.effective}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-ink-soft">{explanation}</p>
    </figure>
  );
}

export function StatusTag({ status }: { status: PreviewRow["status"] }) {
  if (status === "recommended")
    return <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">Recommended</span>;
  if (status === "late")
    return <span className="shrink-0 rounded-full bg-loss-soft px-2.5 py-0.5 text-xs font-semibold text-loss">Misses deadline</span>;
  return <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-soft ring-1 ring-line">Delay risk</span>;
}
