// Run in CI by .github/workflows/ship-next-concept.yml
// Finds the first concept (in scripts/concepts.json order) that doesn't yet exist
// under src/app/concepts/, ships it from drafts/ on its own branch, opens a PR,
// and enables auto-merge. One invocation ships at most one concept.
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { module: mod, concepts } = JSON.parse(readFileSync(join(root, "scripts/concepts.json"), "utf8"));

function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, stdio: "pipe", encoding: "utf8", ...opts }).trim();
}

function shf(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: root, stdio: "pipe", encoding: "utf8", ...opts }).trim();
}

/* scripts/concepts.json keys every concept by its authoring number, which the
   published URL no longer carries. Drafts and branches keep the numbered name so
   the queue still reads in order; everything public uses the stripped slug. */
const published = (l) => l.slug.replace(/^\d{2}-/, "");

const next = concepts.find((l) => !existsSync(join(root, "src/concepts", `${published(l)}.tsx`)));

if (!next) {
  console.log("All concepts already shipped — nothing to do.");
  process.exit(0);
}

const draftPath = join(root, "drafts/foundations-of-distributed-architecture", `${next.slug}.tsx`);
if (!existsSync(draftPath)) {
  console.error(`No draft found at ${draftPath} for concept ${next.number} (${next.slug}).`);
  process.exit(1);
}

const branch = `concept/${next.slug}`;
sh(`git checkout -b ${branch}`);

/* One body per concept under src/concepts; the /concepts/[slug] route renders and titles it. */
const bodiesDir = join(root, "src/concepts");
mkdirSync(bodiesDir, { recursive: true });
renameSync(draftPath, join(bodiesDir, `${published(next)}.tsx`));

const conceptsDataPath = join(root, "src/lib/concepts.ts");
const conceptsData = readFileSync(conceptsDataPath, "utf8");
const esc = (value) => value.replace(/"/g, '\\"');
/* The description becomes the concept page's meta description, so it ships with the entry. */
if (typeof next.minutes !== "number") {
  console.error(`"${next.slug}" has no "minutes" in scripts/concepts.json. Read time is shown on the`);
  console.error(`dashboard and is not derivable here, so set it before shipping: roughly the`);
  console.error(`rendered word count divided by 200.`);
  process.exit(1);
}
const entry = `      { slug: "${published(next)}", number: ${next.number}, minutes: ${next.minutes}, title: "${esc(next.title)}", description: "${esc(next.subtitle)}" },\n`;
const marker = "      // CONCEPT_ENTRIES_END";
if (!conceptsData.includes(marker)) {
  console.error("CONCEPT_ENTRIES_END marker not found in src/lib/concepts.ts");
  process.exit(1);
}
writeFileSync(conceptsDataPath, conceptsData.replace(marker, entry + marker));

/* Same idea for the public concept index in the README. */
const readmePath = join(root, "README.md");
const readme = readFileSync(readmePath, "utf8");
const readmeMarker = "<!-- CONCEPT_LINKS_END -->";
const link = `- [${next.title}](https://systemdesignbits.vercel.app/concepts/${published(next)}) \u2014 ${next.subtitle}\n`;
if (!readme.includes(readmeMarker)) {
  console.error("CONCEPT_LINKS_END marker not found in README.md");
  process.exit(1);
}
writeFileSync(readmePath, readme.replace(readmeMarker, link + readmeMarker));

sh(`git add -A`);
shf("git", [
  "-c", "user.name=concept-bot",
  "-c", "user.email=concept-bot@users.noreply.github.com",
  "commit", "-m", `Add concept ${next.number}: ${next.title}`,
]);
sh(`git push -u origin ${branch}`);

const prBody = [
  `Adds concept ${next.number}/${concepts.length} of "${mod.title}".`,
  "",
  `**${next.title}**`,
  next.subtitle,
].join("\n");

shf("gh", [
  "pr", "create",
  "--base", "main",
  "--head", branch,
  "--title", `Concept ${next.number}: ${next.title}`,
  "--body", prBody,
]);

try {
  sh(`gh pr merge ${branch} --auto --squash`);
  console.log(`Opened and set to auto-merge: ${branch}`);
} catch (err) {
  console.warn(
    "Could not enable auto-merge (repo setting or branch protection likely not configured yet). PR was still opened.",
    err.message
  );
}
