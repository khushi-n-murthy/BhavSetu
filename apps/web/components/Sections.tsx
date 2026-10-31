import { business, buildlog, field, how, site, sourceById, sources, stakeholders, stats, team } from "@/lib/content";
import { formatINR, formatNumber } from "@/lib/engines";

export function Section({
  id,
  title,
  lead,
  tone = "paper",
  children,
}: {
  id: string;
  title: string;
  lead?: React.ReactNode;
  tone?: "paper" | "surface";
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`border-b border-line ${tone === "surface" ? "bg-surface" : "bg-paper"}`}>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <h2 id={`${id}-title`} className="text-[1.75rem] font-bold leading-tight sm:text-[2.1rem]">
          {title}
        </h2>
        {lead && <div className="mt-3 max-w-[44rem] text-lg text-ink-soft">{lead}</div>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function SourceLink({ id, children }: { id: string; children?: React.ReactNode }) {
  const s = sourceById(id);
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="link">
      {children ?? s.publisher}
    </a>
  );
}

export function Nav() {
  const items = [
    { href: "#demo", label: "Demo" },
    { href: "#how", label: "How it works" },
    { href: "#research", label: "Research" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#top" aria-label={`${site.product}, back to top`} className="flex shrink-0 items-center gap-2 font-bold no-underline">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-ink text-sm text-white">
            भा
          </span>
          <span className="hidden sm:inline">{site.product}</span>
        </a>
        <ul className="ml-auto flex items-center gap-1 overflow-x-auto text-sm font-medium sm:gap-2">
          {items.map((i) => (
            <li key={i.href}>
              <a href={i.href} className="block whitespace-nowrap rounded-full px-2.5 py-2 no-underline hover:bg-surface">
                {i.label}
              </a>
            </li>
          ))}
          {site.links.github && (
            <li>
              <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="block whitespace-nowrap rounded-full px-2.5 py-2 no-underline hover:bg-surface">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export function StatCards() {
  return (
    <Section id="problem" title="Small factories overpay for material and quote orders at a loss" lead={<p>The owner calls 5–10 suppliers for every purchase, compares rates on paper and prices jobs by rule of thumb, while also running the shop floor.</p>} tone="surface">
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.number} className="flex flex-col bg-paper p-5">
            <p className="num text-[1.7rem] font-bold leading-tight">{s.number}</p>
            <p className="mt-2 flex-1 text-[0.95rem] text-ink-soft">{s.label}</p>
            <p className="mt-4 text-sm text-muted">
              Source:{" "}
              {s.sourceIds.map((id, i) => (
                <span key={id}>
                  {i > 0 && "; "}
                  <SourceLink id={id} />
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function HowItWorks() {
  return (
    <Section id="how" title="How it works" lead={<p>{how.intro}</p>}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <figure>
          <ol className="space-y-2" aria-label="Architecture, from the WhatsApp channel down to integrations">
            {how.layers.map((l, i) => (
              <li
                key={l.name}
                className={`rounded-xl border p-3 ${i === 2 ? "border-ink bg-ink text-white" : i === 4 ? "border-accent bg-accent-soft" : i === 5 ? "border-dashed border-muted bg-paper" : "border-line bg-surface"}`}
              >
                <p className="font-semibold">{l.name}</p>
                <p className={`mt-1 text-sm ${i === 2 ? "text-white/85" : "text-ink-soft"}`}>{l.items.join(" · ")}</p>
              </li>
            ))}
          </ol>
          <figcaption className="mt-3 text-sm text-muted">
            Messages enter through WhatsApp and reach Munim, which hands work to five agents. Agents call the deterministic engines for every number and touch outside
            systems only through labelled integrations.
          </figcaption>
        </figure>

        <div>
          <h3 className="text-xl font-semibold">Five agents, one orchestrator</h3>
          <dl className="mt-4 space-y-3">
            {how.agents.map((a) => (
              <div key={a.name} className="grid grid-cols-[6.5rem_1fr] gap-3">
                <dt className="font-semibold">
                  {a.name} <span className="block text-sm font-normal text-muted">{a.meaning}</span>
                </dt>
                <dd className="text-[0.95rem] text-ink-soft">{a.job}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <h3 className="mt-14 text-xl font-semibold">Agentic, by the organisers&rsquo; own definition</h3>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[40rem] text-left text-[0.95rem]">
          <thead className="bg-surface text-sm text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">The brief asks for</th>
              <th scope="col" className="px-4 py-3 font-medium">How BhavSetu does it</th>
              <th scope="col" className="px-4 py-3 font-medium">Where to see it</th>
            </tr>
          </thead>
          <tbody>
            {how.properties.map((p) => (
              <tr key={p.brief} className="border-t border-line align-top">
                <th scope="row" className="px-4 py-3 font-semibold">{p.brief}</th>
                <td className="px-4 py-3 text-ink-soft">{p.how}</td>
                <td className="px-4 py-3">
                  <a href="#demo" className="link">{p.demo}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-14 text-xl font-semibold">Guardrails: the agent negotiates and recommends; only the owner awards, commits or pays</h3>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[44rem] text-left text-[0.95rem]">
          <thead className="bg-surface text-sm text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Action</th>
              <th scope="col" className="px-4 py-3 font-medium">Agent may</th>
              <th scope="col" className="px-4 py-3 font-medium">Agent may not</th>
              <th scope="col" className="px-4 py-3 font-medium">Owner&rsquo;s control</th>
            </tr>
          </thead>
          <tbody>
            {how.guardrails.map((g) => (
              <tr key={g.action} className="border-t border-line align-top">
                <th scope="row" className="px-4 py-3 font-semibold">{g.action}</th>
                <td className="px-4 py-3 text-ink-soft">{g.may}</td>
                <td className="px-4 py-3 text-loss">{g.mayNot}</td>
                <td className="px-4 py-3 text-ink-soft">{g.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-5 grid gap-x-8 gap-y-2 text-[0.95rem] text-ink-soft md:grid-cols-2">
        {how.safeguards.map((s) => (
          <li key={s} className="flex gap-2">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
            {s}
          </li>
        ))}
      </ul>

      <h3 className="mt-14 text-xl font-semibold">What is real on this page, and what is simulated</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-2 border-accent p-5">
          <p className="font-semibold text-accent-strong">Real, and tested</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">
            {how.realVsSimulated.real.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-muted p-5">
          <p className="font-semibold">Simulated with sample data</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">
            {how.realVsSimulated.simulated.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-[0.95rem] text-ink-soft">{how.realVsSimulated.next}</p>
    </Section>
  );
}

export function FieldNotes() {
  const totalTargets = field.targets.reduce((a, t) => a + t.count, 0);
  const done = field.interviews.length;
  return (
    <Section id="field" title="Field research" lead={<p>{field.status}</p>} tone="surface">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <p className="num text-4xl font-bold">
            {done} <span className="text-xl font-semibold text-muted">of {totalTargets} interviews</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={`${done} of ${totalTargets} planned interviews done`}>
            <div className="h-full bg-accent" style={{ width: `${Math.min(100, (done / totalTargets) * 100)}%` }} />
          </div>
          <ul className="mt-6 space-y-3">
            {field.clusters.map((c) => (
              <li key={c.name} className="rounded-xl border border-line bg-paper p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-ink-soft">
                  {c.detail}
                  {c.sourceId && (
                    <>
                      {" "}
                      (<SourceLink id={c.sourceId} />)
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 font-semibold">Who we are meeting</h3>
          <ul className="num mt-2 grid grid-cols-1 gap-x-6 text-sm text-ink-soft sm:grid-cols-2">
            {field.targets.map((t) => (
              <li key={t.who} className="flex justify-between border-b border-line py-1.5">
                <span>{t.who}</span>
                <span>{t.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {field.interviews.length > 0 && (
            <>
              <h3 className="font-semibold">What owners told us</h3>
              <ul className="mt-3 space-y-3">
                {field.interviews.map((iv, i) => (
                  <li key={i} className="rounded-xl border border-line bg-paper p-4">
                    {iv.quote && <blockquote className="text-lg">&ldquo;{iv.quote}&rdquo;</blockquote>}
                    <p className="mt-1 text-sm text-ink-soft">{iv.notes}</p>
                    <p className="mt-2 text-xs text-muted">
                      {iv.who}, {iv.cluster}, {iv.date}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {field.insights.length > 0 && (
            <>
              <h3 className="mt-6 font-semibold">What we learned</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">{field.insights.map((x) => <li key={x}>{x}</li>)}</ul>
            </>
          )}
          {field.changes.length > 0 && (
            <>
              <h3 className="mt-6 font-semibold">What we changed because of the field</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">{field.changes.map((x) => <li key={x}>{x}</li>)}</ul>
            </>
          )}

          <h3 className={`font-semibold ${field.interviews.length ? "mt-8" : ""}`}>The six questions we take into every unit</h3>
          <ol className="mt-3 space-y-3">
            {field.questions.map((q, i) => (
              <li key={q.q} className="grid grid-cols-[1.75rem_1fr] gap-2">
                <span className="num font-semibold text-muted">{i + 1}</span>
                <div>
                  <p className="font-medium">{q.q}</p>
                  <p className="text-sm text-muted">Shapes the build: {q.shapes}</p>
                </div>
              </li>
            ))}
          </ol>
          <h3 className="mt-6 font-semibold">And four of our own</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem] text-ink-soft">
            {field.probes.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">Notes appear only with the interviewee&rsquo;s consent. No unit is named without written permission, and photos are blurred.</p>
        </div>
      </div>
    </Section>
  );
}

export function Stakeholders() {
  return (
    <Section id="stakeholders" title="Everyone in the picture gains" lead={<p>Every party named in the problem statement, plus lenders, government schemes and local youth, gets a concrete reason to use BhavSetu.</p>}>
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="hidden grid-cols-[12rem_1fr_1.2fr_1fr] gap-4 bg-surface px-5 py-3 text-sm text-muted md:grid">
          <span>Who</span>
          <span>Their pain today</span>
          <span>What BhavSetu does</span>
          <span>What they gain</span>
        </div>
        <ul>
          {stakeholders.map((s) => (
            <li key={s.who} className="grid gap-1 border-t border-line px-5 py-4 first:border-t-0 md:grid-cols-[12rem_1fr_1.2fr_1fr] md:gap-4 md:first:border-t">
              <p className="font-semibold">{s.who}</p>
              <p className="text-[0.95rem] text-ink-soft">
                <span className="text-muted md:hidden">Pain: </span>
                {s.pain}
              </p>
              <p className="text-[0.95rem]">
                <span className="text-muted md:hidden">BhavSetu: </span>
                {s.feature}
              </p>
              <p className="text-[0.95rem] font-medium text-accent-strong">
                <span className="font-normal text-muted md:hidden">Gain: </span>
                {s.gain}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function BusinessFacts() {
  const c = business.costPerCycle;
  const msgCost = c.messages * c.perMessage;
  const voiceCost = c.voiceMinutes * c.perMinute;
  const perCycle = msgCost + voiceCost + c.llmAndParsing;
  const perMonth = perCycle * c.cyclesPerMonth;

  const e = business.economics;
  const peenyaUnits = e.peenyaUnits * e.peenyaAdoption;
  const peenyaRevenue = peenyaUnits * e.avgRevenuePerMonth * 12;
  const indiaUnits = e.indiaMfgUnits * e.indiaAdoption;
  const indiaRevenue = indiaUnits * e.avgRevenuePerMonth * 12;
  const crore = (n: number) => `₹${formatNumber(n / 1e7, 1)} crore`;
  const margin = 1 - perMonth / e.avgRevenuePerMonth;

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-2">
      <div>
        <h3 className="text-xl font-semibold">Who pays</h3>
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
          {business.pricing.map((p) => (
            <li key={p.plan} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4">
              <div>
                <p className="font-semibold">{p.plan}</p>
                <p className="text-sm text-ink-soft">{p.detail}</p>
              </div>
              <p className="num font-semibold">{p.price}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">The owner gains most, so the owner pays a small subscription. Prices are to be tested in the field.</p>
        <table className="mt-5 w-full text-left text-sm">
          <caption className="mb-2 text-left font-semibold text-ink">Other revenue</caption>
          <tbody>
            {business.otherRevenue.map((r) => (
              <tr key={r.stream} className="border-t border-line align-top">
                <th scope="row" className="py-2 pr-3 font-medium">{r.stream}</th>
                <td className="py-2 pr-3 text-ink-soft">{r.payer}</td>
                <td className="py-2 text-ink-soft">{r.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-xl font-semibold">What it costs to serve</h3>
        <table className="num mt-4 w-full text-sm">
          <caption className="sr-only">Cost of one purchase cycle</caption>
          <tbody>
            <tr className="border-b border-line">
              <th scope="row" className="py-2 text-left font-normal">
                {c.messages} WhatsApp messages × ₹{c.perMessage} (<SourceLink id={c.messageSourceId}>rate card</SourceLink>)
              </th>
              <td className="py-2 text-right">₹{formatNumber(msgCost, 2)}</td>
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="py-2 text-left font-normal">
                {c.voiceMinutes} min of speech-to-text × ₹{c.perMinute} (<SourceLink id={c.voiceSourceId}>Sarvam</SourceLink>)
              </th>
              <td className="py-2 text-right">₹{formatNumber(voiceCost, 2)}</td>
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="py-2 text-left font-normal">Language model and document parsing (estimate)</th>
              <td className="py-2 text-right">₹{formatNumber(c.llmAndParsing, 2)}</td>
            </tr>
            <tr>
              <th scope="row" className="py-2 text-left font-semibold">One purchase cycle</th>
              <td className="py-2 text-right font-semibold">₹{formatNumber(perCycle, 2)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-sm text-ink-soft">
          A unit running {c.cyclesPerMonth} purchases a month costs about {formatINR(perMonth)} to serve, against {formatINR(e.avgRevenuePerMonth)} average revenue: roughly{" "}
          {Math.round(margin * 100)}% gross margin before support.
        </p>

        <h3 className="mt-8 text-xl font-semibold">Market and jobs</h3>
        <dl className="num mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
          <div className="bg-paper p-4">
            <dt className="text-muted">
              {Math.round(e.peenyaAdoption * 100)}% of Peenya&rsquo;s {formatNumber(e.peenyaUnits)} units (<SourceLink id={e.peenyaSourceId}>source</SourceLink>)
            </dt>
            <dd className="mt-1 text-xl font-bold">{crore(peenyaRevenue)} a year</dd>
            <dd className="text-ink-soft">{formatNumber(peenyaUnits / e.unitsPerSaathi)} Cluster Saathi jobs</dd>
          </div>
          <div className="bg-paper p-4">
            <dt className="text-muted">
              {Math.round(e.indiaAdoption * 100)}% of India&rsquo;s {formatNumber(e.indiaMfgUnits / 1e7, 2)} crore manufacturing MSMEs (<SourceLink id={e.indiaSourceId}>source</SourceLink>)
            </dt>
            <dd className="mt-1 text-xl font-bold">{crore(indiaRevenue)} a year</dd>
            <dd className="text-ink-soft">{formatNumber(indiaUnits / e.unitsPerSaathi)} Cluster Saathi jobs</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-ink-soft">
          A Cluster Saathi is a trained local youth at a JanAI Café or association office who onboards units and runs assisted sessions. One Saathi supports about{" "}
          {e.unitsPerSaathi} units and earns about {formatINR(e.saathiMonthlyIncome)} a month. Every RFQ also introduces BhavSetu to more MSMEs, which recruits the next users.
        </p>
      </div>
    </div>
  );
}

export function BuildLog() {
  const items = [...buildlog].sort((a, b) => b.date.localeCompare(a.date));
  const fmt = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return (
    <Section id="log" title="Build log" lead={<p>Dated updates, newest first. This page grows with the project, so judges who come back should see progress.</p>} tone="surface">
      <ol className="relative space-y-6 border-l-2 border-line pl-6">
        {items.map((it, i) => (
          <li key={i} className="relative">
            <span aria-hidden className="absolute -left-[1.95rem] top-1.5 size-3.5 rounded-full border-2 border-paper bg-accent" />
            <time dateTime={it.date} className="num text-sm font-semibold text-muted">
              {fmt(it.date)}
            </time>
            <p className="mt-1 max-w-[44rem]">{it.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Sources() {
  const groups = [...new Set(sources.map((s) => s.group))];
  return (
    <Section id="research" title="Research library" lead={<p>Every source behind a number on this page, with what it supports.</p>}>
      <div className="space-y-8">
        {groups.map((g) => (
          <div key={g}>
            <h3 className="font-semibold">{g}</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {sources
                .filter((s) => s.group === g)
                .map((s) => (
                  <li key={s.id} className="grid gap-1 py-3 md:grid-cols-[1.4fr_1fr] md:gap-6">
                    <div>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="link font-medium">
                        {s.title}
                      </a>
                      <p className="text-sm text-muted">
                        {s.publisher}, {s.date}
                      </p>
                    </div>
                    <p className="text-sm text-ink-soft">{s.supports}</p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Team() {
  const named = team.members.filter((m) => m.name);
  return (
    <Section id="team" title="Team and responsible AI" tone="surface">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          {(site.teamName || site.college) && (
            <p className="mb-4 text-lg">
              {site.teamName && <strong>{site.teamName}</strong>}
              {site.teamName && site.college && ", "}
              {site.college}
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {team.members.map((m) => (
              <li key={m.role} className="flex gap-3 rounded-xl border border-line bg-paper p-4">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} width={56} height={56} loading="lazy" className="size-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-lg font-bold text-white">
                    {m.name ? m.name.trim()[0] : m.role}
                  </span>
                )}
                <div>
                  {m.name && <p className="font-semibold">{m.name}</p>}
                  <p className={m.name ? "text-sm text-accent-strong" : "font-semibold"}>{m.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{m.owns}</p>
                </div>
              </li>
            ))}
          </ul>
          {named.length === 0 && <p className="mt-3 text-sm text-muted">A team of four students, one per role.</p>}
          {team.credits.length > 0 && (
            <p className="mt-4 text-sm text-muted">Thanks to {team.credits.join(", ")}.</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold">Responsible AI</h3>
          <ul className="mt-3 space-y-2 text-[0.95rem] text-ink-soft">
            {team.responsibleAI.map((r) => (
              <li key={r} className="flex gap-2">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {r}
              </li>
            ))}
          </ul>
          {site.email && (
            <p className="mt-6">
              Contact:{" "}
              <a href={`mailto:${site.email}`} className="link font-semibold">
                {site.email}
              </a>
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm sm:px-6">
        <p className="max-w-[48rem] text-white/90">{team.disclosure}</p>
        <p className="mt-4 text-white/70">
          {site.product} ({site.productDevanagari}, &ldquo;price bridge&rdquo;) for{" "}
          <a href={site.hackathon.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {site.hackathon.name}
          </a>
          , Problem {site.hackathon.problem}, {site.hackathon.track}. All people and company names in the demo are fictional.
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-white/70">
          {site.links.github && (
            <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              Source on GitHub (MIT)
            </a>
          )}
          {site.email && (
            <a href={`mailto:${site.email}`} className="underline underline-offset-2">
              {site.email}
            </a>
          )}
        </p>
      </div>
    </footer>
  );
}
