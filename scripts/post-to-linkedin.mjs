// Run in CI by .github/workflows/linkedin-post.yml after a lesson/* PR merges.
// Usage: node scripts/post-to-linkedin.mjs <branch-ref>   (e.g. "lesson/01-horizontal-vs-vertical-scaling")
//
// Requires secrets:
//   LINKEDIN_ACCESS_TOKEN  - member access token with the w_member_social scope
//   LINKEDIN_AUTHOR_URN    - "urn:li:person:xxxxx", from GET https://api.linkedin.com/v2/userinfo
// Optional repo variable:
//   SITE_URL               - e.g. https://your-project.vercel.app (defaults below)
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { module: mod, lessons } = JSON.parse(readFileSync(join(root, "scripts/lessons.json"), "utf8"));

const branchRef = process.argv[2];
if (!branchRef) {
  console.error("Usage: node scripts/post-to-linkedin.mjs <branch-ref>");
  process.exit(1);
}
const slug = branchRef.replace(/^lesson\//, "");
const lesson = lessons.find((l) => l.slug === slug);
if (!lesson) {
  console.error(`No lesson metadata for slug "${slug}" — skipping post.`);
  process.exit(1);
}

const token = process.env.LINKEDIN_ACCESS_TOKEN;
const author = process.env.LINKEDIN_AUTHOR_URN;
if (!token || !author) {
  console.error("Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN secret — skipping post.");
  process.exit(1);
}

const siteUrl = process.env.SITE_URL || "https://your-project.vercel.app";
const link = `${siteUrl}${mod.basePath}/${lesson.slug}`;

const commentary = [
  `New lesson in "${mod.title}": ${lesson.title}`,
  "",
  lesson.subtitle,
  "",
  lesson.insight,
  "",
  `Lesson ${lesson.number}/${lessons.length} → ${link}`,
].join("\n");

const res = await fetch("https://api.linkedin.com/rest/posts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
    "LinkedIn-Version": "202401",
  },
  body: JSON.stringify({
    author,
    commentary,
    visibility: "PUBLIC",
    distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  }),
});

if (!res.ok) {
  console.error(`LinkedIn API error ${res.status}: ${await res.text()}`);
  process.exit(1);
}

console.log(`Posted lesson ${lesson.number} (${lesson.slug}) to LinkedIn.`);
