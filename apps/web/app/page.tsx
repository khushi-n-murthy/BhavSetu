import { existsSync } from "node:fs";
import { join } from "node:path";

import { business, demoScript, hero, sampleJob, sampleQuotes, site } from "@/lib/content";
import {
  formatDateShort,
  formatINR,
  landedCost,
  negotiationSaving,
  rankSuppliers,
} from "@/lib/engines";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Hero, type PreviewRow } from "@/components/Hero";
import { PurchaseSimulator, type SimTableRow } from "@/components/PurchaseSimulator";
import { SupplierCalculator } from "@/components/SupplierCalculator";
import { LossGuard } from "@/components/LossGuard";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import {
  BuildLog,
  BusinessFacts,
  FieldNotes,
  Footer,
  HowItWorks,
  Nav,
  Section,
  Sources,
  StatCards,
  Stakeholders,
  Team,
} from "@/components/Sections";

/** A local file link (e.g. /deck.pdf) is shown only once the file is in public/. */
function liveLink(href: string): string {
  if (!href) return "";
  if (href.startsWith("/")) return existsSync(join(process.cwd(), "public", href)) ? href : "";
  return href;
}

export default function Page() {
  const ctx = sampleQuotes.context;
  const suppliers = sampleQuotes.suppliers;

  // Every number in the hero and the simulator comes from the engines.
  const ranking = rankSuppliers(suppliers, ctx);
  const status = (id: string): PreviewRow["status"] => {
    const r = ranking.rows.find((x) => x.quote.id === id)!;
    return r.recommended ? "recommended" : r.risk.missesDeadline ? "late" : "risk";
  };
  const byRate = [...suppliers].sort((a, b) => a.rate - b.rate).map((s) => s.id);

  const previewRows: PreviewRow[] = ranking.rows.map((r) => ({
    name: r.quote.name,
    rate: formatINR(r.quote.rate),
    landed: formatINR(r.cost.landed),
    delay: formatINR(r.risk.delayCost),
    effective: formatINR(r.effective),
    status: status(r.quote.id),
    rateRank: byRate.indexOf(r.quote.id) + 1,
  }));

  const tableRows: SimTableRow[] = ranking.rows.map((r) => ({
    id: r.quote.id,
    name: r.quote.name,
    landed: formatINR(r.cost.landed),
    arrival: formatDateShort(r.quote.promised),
    delayCost: formatINR(r.risk.delayCost),
    effective: formatINR(r.effective),
    status: status(r.quote.id),
  }));

  // Negotiation step: must stay inside the owner's ceiling, or the build fails.
  const neg = demoScript.negotiation;
  const target = suppliers.find((s) => s.id === neg.supplierId)!;
  if (ranking.recommendedId !== neg.supplierId) {
    throw new Error(`demo-script negotiates with ${neg.supplierId}, but the engine recommends ${ranking.recommendedId}`);
  }
  const deal = negotiationSaving(target.qty, target.rate, neg.counterRate, neg.ceiling);
  if (!deal.withinCeiling) throw new Error("demo-script counter-offer exceeds the owner's ceiling");
  const finalCost = landedCost({ ...target, rate: neg.counterRate, gstRate: ctx.gstRate, itcClaimable: ctx.itcClaimable, costOfCapital: ctx.costOfCapital });

  const vars: Record<string, string> = {
    needBy: formatDateShort(ranking.needBy),
    customerDate: formatDateShort(ctx.customerDate),
    finalRate: formatINR(neg.counterRate),
    finalDate: formatDateShort(target.promised),
    landedFinal: formatINR(finalCost.landed),
    saved: formatINR(deal.saved),
    ceiling: formatINR(neg.ceiling),
    recommendedName: target.name,
    costPerDay: formatINR(ctx.costPerDayDelay),
    poNumber: demoScript.po.number,
  };

  const links = {
    github: site.links.github,
    deck: liveLink(site.links.deck),
    demoVideo: site.links.demoVideo,
  };
  const teamLine = [site.teamName, site.college].filter(Boolean).join(", ");

  return (
    <LanguageProvider>
      <Nav />
      <main id="main">
        <div id="top" />
        <Hero copy={hero} links={links} preview={{ rows: previewRows, needBy: vars.needBy, explanation: ranking.explanation }} teamLine={teamLine} />

        <StatCards />

        <Section
          id="demo"
          title="Try a purchase"
          lead={
            <p>
              One order, start to finish: the owner speaks, three suppliers reply in three languages and three formats, and the agents bring back one decision for
              a tap. Watch the trace to see what each agent did.
            </p>
          }
        >
          <PurchaseSimulator
            script={demoScript}
            vars={vars}
            suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
            table={{ rows: tableRows, explanation: ranking.explanation }}
            po={{
              number: demoScript.po.number,
              supplier: `${target.name}, ${target.place}`,
              item: `${target.qty} t of ${demoScript.order.item}`,
              rate: formatINR(neg.counterRate),
              landed: formatINR(finalCost.landed),
              delivery: formatDateShort(target.promised),
              forOrder: `${demoScript.order.customer} order`,
            }}
          />
        </Section>

        <Section
          id="best-supplier"
          title="Best option, not the cheapest"
          tone="surface"
          lead={
            <p>
              Change any quote or the customer&rsquo;s deadline and watch the ranking move. A rate that saves a few thousand rupees but makes the order late can cost
              far more in penalties and idle hours.
            </p>
          }
        >
          <SupplierCalculator seed={{ context: ctx, suppliers }} gstRate={ctx.gstRate} />
        </Section>

        <Section
          id="loss-guard"
          title="Loss Guard: no quote goes out below cost"
          lead={<p>Enter a job&rsquo;s costs and the price you plan to quote. Loss Guard builds the full cost line by line, including the cost of waiting to be paid, and blocks a quote that loses money.</p>}
        >
          <LossGuard title={sampleJob.title} input={sampleJob.input} />
        </Section>

        <HowItWorks />
        <FieldNotes />
        <Stakeholders />

        <Section
          id="business"
          title="Following the money"
          tone="surface"
          lead={<p>The owner gains most when the unit stops overpaying. Set your own assumptions to see by how much.</p>}
        >
          <SavingsCalculator defaults={business.savingsDefaults} />
          <BusinessFacts />
        </Section>

        <BuildLog />
        <Sources />
        <Team />
      </main>
      <Footer />
    </LanguageProvider>
  );
}
