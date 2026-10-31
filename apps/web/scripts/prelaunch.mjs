// Pre-launch check: run `npm run prelaunch` before the final deploy.
// Fails on anything the QA checklist forbids: empty links, unnamed team,
// [brackets] or lorem ipsum in content, a missing deck file.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (f) => JSON.parse(readFileSync(join(root, "content", f), "utf8"));
const problems = [];
const warnings = [];

const site = read("site.json");
if (!site.links.github) problems.push("site.json: links.github is empty (the hero GitHub button is hidden)");
if (!site.links.demoVideo) warnings.push("site.json: links.demoVideo is empty (the video button is hidden)");
if (!site.email) problems.push("site.json: email is empty (no contact on the page)");
if (!site.teamName) warnings.push("site.json: teamName is empty");
if (!site.college) warnings.push("site.json: college is empty");
if (site.links.deck.startsWith("/") && !existsSync(join(root, "public", site.links.deck))) {
  problems.push(`public${site.links.deck} is missing (the deck button is hidden until it exists)`);
}

const team = read("team.json");
team.members.filter((m) => !m.name).forEach((m) => problems.push(`team.json: role ${m.role} (${m.title}) has no name`));
if (team.credits.length === 0) warnings.push("team.json: no credits yet (add the native speaker who checked Kannada and Hindi)");

const field = read("field.json");
if (field.interviews.length === 0) warnings.push("field.json: no interviews yet");

for (const f of readdirSync(join(root, "content"))) {
  const text = readFileSync(join(root, "content", f), "utf8").replace(/"\$comment":\s*"[^"]*"/g, "");
  if (/lorem ipsum/i.test(text)) problems.push(`${f}: contains lorem ipsum`);
  const bracket = text.match(/\[[A-Za-z][^\]"]{0,40}\]/);
  if (bracket) problems.push(`${f}: placeholder ${bracket[0]}`);
}

for (const w of warnings) console.log(`  warn  ${w}`);
for (const p of problems) console.log(`  FAIL  ${p}`);
if (problems.length) {
  console.log(`\n${problems.length} thing(s) to fix before launch.`);
  process.exit(1);
}
console.log("\nReady to launch.");
