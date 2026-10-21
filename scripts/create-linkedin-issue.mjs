// Run in CI by .github/workflows/linkedin-post.yml after a concept/* PR merges.
// Opens a GitHub issue with ready-to-paste LinkedIn post copy — no LinkedIn
// API involved, just a reminder with the text already written.
// Usage: node scripts/create-linkedin-issue.mjs <branch-ref>
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { module: mod, concepts } = JSON.parse(readFileSync(join(root, "scripts/concepts.json"), "utf8"));

const branchRef = process.argv[2];
if (!branchRef) {
  console.error("Usage: node scripts/create-linkedin-issue.mjs <branch-ref>");
  process.exit(1);
}
const slug = branchRef.replace(/^concept\//, "");
const concept = concepts.find((l) => l.slug === slug);
if (!concept) {
  console.error(`No concept metadata for slug "${slug}" — skipping.`);
  process.exit(1);
}

const siteUrl = process.env.SITE_URL || "https://your-project.vercel.app";
/* The branch keeps the authoring number; the published URL drops it. */
const link = `${siteUrl}${mod.basePath}/${concept.slug.replace(/^\d{2}-/, "")}`;

const post = [
  `New concept in "${mod.title}": ${concept.title}`,
  "",
  concept.subtitle,
  "",
  concept.insight,
  "",
  `Concept ${concept.number}/${concepts.length} → ${link}`,
].join("\n");

const body = ["Copy the text below into a LinkedIn post, then close this issue.", "", "---", "", post].join("\n");

execFileSync(
  "gh",
  ["issue", "create", "--title", `Post to LinkedIn — Concept ${concept.number}: ${concept.title}`, "--body", body],
  { cwd: root, stdio: "inherit" }
);
