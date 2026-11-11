import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Hero, LearnedToggle, PrepBrowser } from "@/components";
import { parseSections } from "@/lib/interviewPrep";
import { SITE_NAME } from "@/lib/seo";

/* Read where the page renders, not at module scope. The page is static, so in
   production this still runs once at build — but in dev the module is cached and
   the content file is not one of its imports, so a module-scope read serves the
   version from whenever the server started, however many times the document is
   edited. Reading per render is what makes editing the prose visible. */
function read() {
  return parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  );
}

const description =
  "Frontend interview questions answered in full: the event loop, closures, React rendering and memoisation, Web Vitals, collections, generators and the live coding tasks. Open a card for the whole answer.";

export const metadata: Metadata = {
  title: "Frontend interview Q&A",
  description,
  alternates: { canonical: "/interview-qa" },
  openGraph: {
    type: "website",
    url: "/interview-qa",
    siteName: SITE_NAME,
    title: `Frontend interview Q&A · ${SITE_NAME}`,
    description,
  },
};

export default function InterviewQAPage() {
  const sections = read();

  return (
    <>
      <LearnedToggle />
      <Hero eyebrow="Interview Q&amp;A" title="Questions, answered">
        {sections.length} frontend interview questions, each written out the way you would
        actually say it in the room — the analogy first, then the mechanism, then the follow-up
        they ask next. Scan the contents, or open a card for the full answer.
      </Hero>

      <PrepBrowser sections={sections} />
    </>
  );
}
