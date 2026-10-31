// Every word and number on the page lives in content/*.json. Each file is
// validated here at build time, so a typo fails the build rather than the page.
import "server-only";
import { z } from "zod";

import siteJson from "@/content/site.json";
import heroJson from "@/content/hero.json";
import statsJson from "@/content/stats.json";
import sourcesJson from "@/content/sources.json";
import quotesJson from "@/content/sample-quotes.json";
import scriptJson from "@/content/demo-script.json";
import jobJson from "@/content/sample-job.json";
import howJson from "@/content/how.json";
import fieldJson from "@/content/field.json";
import stakeholdersJson from "@/content/stakeholders.json";
import businessJson from "@/content/business.json";
import buildlogJson from "@/content/buildlog.json";
import teamJson from "@/content/team.json";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
const share = z.number().min(0).max(1);
const money = z.number().min(0);

const localText = z.object({ en: z.string().min(1), kn: z.string().min(1), hi: z.string().min(1) });
const maybeLocal = z.union([z.string(), localText]);

const SiteSchema = z.object({
  product: z.string().min(1),
  productDevanagari: z.string(),
  title: z.string().min(1),
  oneLiner: z.string().min(1),
  siteUrl: z.url(),
  teamName: z.string(),
  college: z.string(),
  email: z.union([z.email(), z.literal("")]),
  links: z.object({ github: z.string(), deck: z.string(), demoVideo: z.string() }),
  hackathon: z.object({
    name: z.string(),
    url: z.url(),
    problem: z.string(),
    problemTitle: z.string(),
    track: z.string(),
    theme: z.string(),
  }),
});

const HeroSchema = z.object({
  eyebrow: z.string(),
  headline: localText,
  subhead: localText,
  buttons: z.object({ try: localText, github: localText, deck: localText, video: localText }),
  trustLine: localText,
});

const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  date: z.string(),
  url: z.url(),
  supports: z.string(),
  group: z.string(),
});

const StatSchema = z.object({ number: z.string(), label: z.string(), sourceIds: z.array(z.string()).min(1) });

const SupplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  place: z.string(),
  lang: z.string(),
  qty: money,
  rate: money,
  freight: money,
  loading: money,
  creditDays: z.number().min(0),
  promised: isoDate,
  onTime: share,
  slipDays: z.number().min(0),
});

const ContextSchema = z.object({
  customerDate: isoDate,
  productionDays: z.number().int().min(0),
  bufferDays: z.number().int().min(0),
  costPerDayDelay: money,
  costOfCapital: share,
  gstRate: share,
  itcClaimable: z.boolean(),
});

const QuotesSchema = z.object({ context: ContextSchema, suppliers: z.array(SupplierSchema).length(3) });

const TraceSchema = z.object({
  agent: z.string(),
  action: z.string(),
  detail: maybeLocal,
  warn: z.boolean().optional(),
  recover: z.boolean().optional(),
  gate: z.boolean().optional(),
});
export type TraceEvent = z.infer<typeof TraceSchema>;

const MsgSchema = z.object({
  from: z.string(),
  to: z.string().optional(),
  kind: z.enum(["text", "voice", "slip", "table", "approval"]),
  lang: z.string().optional(),
  duration: z.string().optional(),
  text: maybeLocal.optional(),
  sub: z.union([z.string(), z.object({ kn: z.string(), hi: z.string() })]).optional(),
  slip: z.array(z.string()).optional(),
});
export type ChatMsg = z.infer<typeof MsgSchema>;

const ScriptSchema = z.object({
  order: z.object({ customer: z.string(), item: z.string(), qty: z.number(), unit: z.string() }),
  negotiation: z.object({ supplierId: z.string(), counterRate: money, ceiling: money, maxRounds: z.number().int() }),
  po: z.object({ number: z.string() }),
  beats: z.array(z.object({ step: z.number().int().min(1).max(8), msg: MsgSchema, trace: z.array(TraceSchema) })).min(1),
  afterApprove: z.array(TraceSchema),
  labels: z.object({ approve: localText, change: localText, reject: localText }),
});
export type DemoScript = z.infer<typeof ScriptSchema>;

const JobSchema = z.object({
  title: z.string(),
  input: z.object({
    quantity: money,
    netKgPerPiece: money,
    scrapPct: share,
    materialRate: money,
    machineHours: money,
    machineRate: money,
    labourHours: money,
    labourRate: money,
    outsidePerPiece: money,
    overheadPct: share,
    packingDelivery: money,
    paymentDays: money,
    costOfCapital: share,
    minMargin: share,
    quotedPerPiece: money,
  }),
});

const HowSchema = z.object({
  intro: z.string(),
  layers: z.array(z.object({ name: z.string(), items: z.array(z.string()) })).length(6),
  agents: z.array(z.object({ name: z.string(), meaning: z.string(), job: z.string() })),
  properties: z.array(z.object({ brief: z.string(), how: z.string(), demo: z.string() })).length(5),
  guardrails: z.array(z.object({ action: z.string(), may: z.string(), mayNot: z.string(), control: z.string() })),
  safeguards: z.array(z.string()),
  realVsSimulated: z.object({ real: z.array(z.string()), simulated: z.array(z.string()), next: z.string() }),
});

const FieldSchema = z.object({
  status: z.string(),
  clusters: z.array(z.object({ name: z.string(), detail: z.string(), sourceId: z.string().optional() })),
  targets: z.array(z.object({ who: z.string(), count: z.number().int() })),
  questions: z.array(z.object({ q: z.string(), shapes: z.string() })),
  probes: z.array(z.string()),
  interviews: z.array(
    z.object({ date: isoDate, who: z.string(), cluster: z.string(), quote: z.string().optional(), notes: z.string() }),
  ),
  insights: z.array(z.string()),
  changes: z.array(z.string()),
});

const StakeholderSchema = z.object({ who: z.string(), pain: z.string(), feature: z.string(), gain: z.string() });

const BusinessSchema = z.object({
  savingsDefaults: z.object({
    turnover: money,
    materialShare: share,
    savingPct: share,
    lossesAvoided: money,
    avgLoss: money,
  }),
  pricing: z.array(z.object({ plan: z.string(), price: z.string(), detail: z.string() })),
  otherRevenue: z.array(z.object({ stream: z.string(), payer: z.string(), price: z.string() })),
  costPerCycle: z.object({
    messages: money,
    perMessage: money,
    messageSourceId: z.string(),
    voiceMinutes: money,
    perMinute: money,
    voiceSourceId: z.string(),
    llmAndParsing: money,
    cyclesPerMonth: money,
  }),
  economics: z.object({
    avgRevenuePerMonth: money,
    peenyaUnits: money,
    peenyaSourceId: z.string(),
    peenyaAdoption: share,
    indiaMfgUnits: money,
    indiaSourceId: z.string(),
    indiaAdoption: share,
    unitsPerSaathi: money,
    saathiMonthlyIncome: money,
  }),
});

const BuildLogSchema = z.array(z.object({ date: isoDate, text: z.string().min(1) }));

const TeamSchema = z.object({
  members: z.array(z.object({ role: z.string(), title: z.string(), owns: z.string(), name: z.string(), photo: z.string() })),
  credits: z.array(z.string()),
  responsibleAI: z.array(z.string()),
  disclosure: z.string(),
});

function parse<T>(name: string, schema: z.ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    throw new Error(`content/${name} is invalid:\n${z.prettifyError(r.error)}`);
  }
  return r.data;
}

export const site = parse("site.json", SiteSchema, siteJson);
export const hero = parse("hero.json", HeroSchema, heroJson);
export const sources = parse("sources.json", z.array(SourceSchema), sourcesJson);
export const stats = parse("stats.json", z.array(StatSchema).length(4), statsJson);
export const sampleQuotes = parse("sample-quotes.json", QuotesSchema, quotesJson);
export const demoScript = parse("demo-script.json", ScriptSchema, scriptJson);
export const sampleJob = parse("sample-job.json", JobSchema, jobJson);
export const how = parse("how.json", HowSchema, howJson);
export const field = parse("field.json", FieldSchema, fieldJson);
export const stakeholders = parse("stakeholders.json", z.array(StakeholderSchema), stakeholdersJson);
export const business = parse("business.json", BusinessSchema, businessJson);
export const buildlog = parse("buildlog.json", BuildLogSchema, buildlogJson);
export const team = parse("team.json", TeamSchema, teamJson);

// Cross-file checks: every referenced source must exist.
const sourceIds = new Set(sources.map((s) => s.id));
const refs = [
  ...stats.flatMap((s) => s.sourceIds),
  ...field.clusters.flatMap((c) => (c.sourceId ? [c.sourceId] : [])),
  business.costPerCycle.messageSourceId,
  business.costPerCycle.voiceSourceId,
  business.economics.peenyaSourceId,
  business.economics.indiaSourceId,
];
for (const id of refs) {
  if (!sourceIds.has(id)) throw new Error(`Unknown source id "${id}" (add it to content/sources.json)`);
}

export const sourceById = (id: string) => sources.find((s) => s.id === id)!;
