import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Breadcrumb, Hero } from "@/design-system";
import prep from "@/components/InterviewPrep/PrepBrowser.module.css";
import { parseSections } from "@/lib/interviewPrep";
import { SITE_NAME } from "@/lib/seo";
import styles from "../event-loop/eventLoop.module.css";
import ClosurePractice from "./ClosurePractice";
import { EXERCISE } from "./exercise";

/* §7 on a page of its own, for the same reason as /interview-qa/event-loop. */
const SECTION = "s7";

function answer() {
  const sections = parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  );
  return sections.find((section) => section.id === SECTION);
}

const description =
  "Closures answered in full, then a puzzle: what does each console.log print, with a step-through of every scope a function keeps alive.";

export const metadata: Metadata = {
  title: "Closures, step by step",
  description,
  alternates: { canonical: "/interview-qa/closures" },
  openGraph: {
    type: "article",
    url: "/interview-qa/closures",
    siteName: SITE_NAME,
    title: `Closures, step by step · ${SITE_NAME}`,
    description,
  },
};

export default function ClosuresPage() {
  const section = answer();

  return (
    <>
      <Breadcrumb section="Interview Q&A" sectionHref="/interview-qa" concept="Closures" />

      <div className={styles.page}>
        <div className={styles.inner}>
          <Hero eyebrow="JavaScript · practice" title="Closures">
            The answer first, written out the way you would say it in the room. Then a puzzle: fill
            in what each line prints, check it, and step through the scopes each function keeps
            alive.
          </Hero>

          {section && (
            <>
              {/* Authored HTML from src/content, not user input. */}
              <div className={prep.prose} dangerouslySetInnerHTML={{ __html: section.html }} />
              <div id="prep-xref-tip" role="tooltip" hidden />
            </>
          )}

          <h2 className={styles.answerHead}>Now work it out: what does each line print?</h2>

          <ClosurePractice exercise={EXERCISE} />
        </div>
      </div>
    </>
  );
}
