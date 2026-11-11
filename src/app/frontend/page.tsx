import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { parseSections } from "@/lib/interviewPrep";
import { SITE_NAME } from "@/lib/seo";
import { deeper } from "./data";
import FrontendDesign, { type Deeper } from "./FrontendDesign";

/* Sibling to /walkthrough: same chrome as a concept page, but not one of them, so
   it brings its own Breadcrumb and PageLayout and stays out of /concepts. */

const description =
  "A nine stage order for frontend system design: framing, the server/client boundary, the client stack, data ownership, UI states, the network, the performance budget, resilience, and the trust boundary.";

export const metadata: Metadata = {
  title: "A 9-step walkthrough to Frontend System Design",
  description,
  alternates: { canonical: "/frontend" },
  openGraph: {
    type: "article",
    url: "/frontend",
    siteName: SITE_NAME,
    title: `A 9-step walkthrough to Frontend System Design · ${SITE_NAME}`,
    description,
  },
};

/* Titles come from the Q&A document rather than being copied here, so a renamed
   question renames its link. A number that no longer resolves is dropped rather
   than rendered as a dead link — the test is what catches it. */
function links(): Deeper[] {
  const sections = parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  );
  const byNumber = new Map(sections.map((section) => [Number(section.id.slice(1)), section]));

  return deeper.flatMap(({ n, ids }) => {
    const questions = ids.flatMap((id) => {
      const section = byNumber.get(id);
      if (!section) return [];
      return [{ id: section.id, title: section.title, topic: section.topic }];
    });
    return questions.length === 0 ? [] : [{ n, questions }];
  });
}

export default function FrontendDesignPage() {
  return <FrontendDesign deeper={links()} />;
}
