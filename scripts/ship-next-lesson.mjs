// Run in CI by .github/workflows/ship-next-lesson.yml
// Finds the first lesson (in scripts/lessons.json order) that doesn't yet exist
// under src/app/lessons/, ships it from drafts/ on its own branch, opens a PR,
// and enables auto-merge. One invocation ships at most one lesson.
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { module: mod, lessons } = JSON.parse(readFileSync(join(root, "scripts/lessons.json"), "utf8"));

function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, stdio: "pipe", encoding: "utf8", ...opts }).trim();
}

function shf(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { cwd: root, stdio: "pipe", encoding: "utf8", ...opts }).trim();
}

const next = lessons.find((l) => !existsSync(join(root, "src/app/lessons", l.slug, "page.tsx")));

if (!next) {
  console.log("All lessons already shipped — nothing to do.");
  process.exit(0);
}

const draftPath = join(root, "drafts/foundations-of-distributed-architecture", `${next.slug}.tsx`);
if (!existsSync(draftPath)) {
  console.error(`No draft found at ${draftPath} for lesson ${next.number} (${next.slug}).`);
  process.exit(1);
}

const branch = `lesson/${next.slug}`;
sh(`git checkout -b ${branch}`);

const targetDir = join(root, "src/app/lessons", next.slug);
mkdirSync(targetDir, { recursive: true });
renameSync(draftPath, join(targetDir, "page.tsx"));

const lessonsDataPath = join(root, "src/lib/lessons.ts");
const lessonsData = readFileSync(lessonsDataPath, "utf8");
const entry = `      { slug: "${next.slug}", number: ${next.number}, title: "${next.title.replace(/"/g, '\\"')}" },\n`;
const marker = "      // LESSON_ENTRIES_END";
if (!lessonsData.includes(marker)) {
  console.error("LESSON_ENTRIES_END marker not found in src/lib/lessons.ts");
  process.exit(1);
}
writeFileSync(lessonsDataPath, lessonsData.replace(marker, entry + marker));

sh(`git add -A`);
shf("git", [
  "-c", "user.name=lesson-bot",
  "-c", "user.email=lesson-bot@users.noreply.github.com",
  "commit", "-m", `Add lesson ${next.number}: ${next.title}`,
]);
sh(`git push -u origin ${branch}`);

const prBody = [
  `Adds lesson ${next.number}/${lessons.length} of "${mod.title}".`,
  "",
  `**${next.title}**`,
  next.subtitle,
].join("\n");

shf("gh", [
  "pr", "create",
  "--base", "main",
  "--head", branch,
  "--title", `Lesson ${next.number}: ${next.title}`,
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
