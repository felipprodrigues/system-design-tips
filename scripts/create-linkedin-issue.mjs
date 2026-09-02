// Run in CI by .github/workflows/linkedin-post.yml after a lesson/* PR merges.
// Opens a GitHub issue with ready-to-paste LinkedIn post copy — no LinkedIn
// API involved, just a reminder with the text already written.
// Usage: node scripts/create-linkedin-issue.mjs <branch-ref>
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { module: mod, lessons } = JSON.parse(readFileSync(join(root, "scripts/lessons.json"), "utf8"));

const branchRef = process.argv[2];
if (!branchRef) {
  console.error("Usage: node scripts/create-linkedin-issue.mjs <branch-ref>");
  process.exit(1);
}
const slug = branchRef.replace(/^lesson\//, "");
const lesson = lessons.find((l) => l.slug === slug);
if (!lesson) {
  console.error(`No lesson metadata for slug "${slug}" — skipping.`);
  process.exit(1);
}

const siteUrl = process.env.SITE_URL || "https://your-project.vercel.app";
const link = `${siteUrl}${mod.basePath}/${lesson.slug}`;

const post = [
  `New lesson in "${mod.title}": ${lesson.title}`,
  "",
  lesson.subtitle,
  "",
  lesson.insight,
  "",
  `Lesson ${lesson.number}/${lessons.length} → ${link}`,
].join("\n");

const body = ["Copy the text below into a LinkedIn post, then close this issue.", "", "---", "", post].join("\n");

execFileSync(
  "gh",
  ["issue", "create", "--title", `Post to LinkedIn — Lesson ${lesson.number}: ${lesson.title}`, "--body", body],
  { cwd: root, stdio: "inherit" }
);
