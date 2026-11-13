import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { parseSections } from "@/lib/interviewPrep";
import { SITE_NAME } from "@/lib/seo";
import { findings } from "./data";
import PaginatedListSync, { type Deeper } from "./PaginatedListSync";

/* Sibling to /frontend and /walkthrough: the body brings its own Breadcrumb and
   PageLayout, the same chrome a concept page has, but it is not one of them and
   stays out of /concepts and out of the reading order. */

const description =
  "A frontend case study in list state: why pagination can stop after a delete, how a filtered view goes stale, what a deletion does to an offset, and the tests that would have caught each one.";

export const metadata: Metadata = {
  title: "LinkedIn Skills: My Own Experience",
  description,
  alternates: { canonical: "/linkedin-skills" },
  openGraph: {
    type: "article",
    url: "/linkedin-skills",
    siteName: SITE_NAME,
    title: `LinkedIn Skills: My Own Experience · ${SITE_NAME}`,
    description,
  },
};

/* Titles come from the Q&A document rather than being copied into data.ts, so a
   renamed question renames its link here. A number that no longer resolves is
   dropped rather than rendered as a dead link. */
function links(): Record<number, Deeper[]> {
  const sections = parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  );
  const byNumber = new Map(sections.map((section) => [Number(section.id.slice(1)), section]));

  return Object.fromEntries(
    findings.map((finding) => [
      finding.n,
      finding.qa.flatMap((id) => {
        const section = byNumber.get(id);
        if (!section) return [];
        return [{ id: section.id, title: section.title, topic: section.topic }];
      }),
    ]),
  );
}

export default function PaginatedListSyncPage() {
  return <PaginatedListSync deeper={links()} />;
}
