import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Breadcrumb, Hero } from "@/design-system";
import prep from "@/components/InterviewPrep/PrepBrowser.module.css";
import { parseSections } from "@/lib/interviewPrep";
import { SITE_NAME } from "@/lib/seo";
import styles from "../event-loop/eventLoop.module.css";
import PracticeTabs from "../closures/PracticeTabs";
import { EXERCISE, EXTRA } from "./exercise";

/* §70 on a page of its own, for the same reason as /interview-qa/event-loop. */
const s70TION = "SEC";

function answer() {
  const sections = parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  );
  return sections.find((section) => section.id === s70TION);
}

const description =
  "Are arguments passed by value or by reference, answered in full, then two puzzles: what does each console.log print, with a step-through of where every arrow points.";

export const metadata: Metadata = {
  title: "Pass by value or by reference, step by step",
  description,
  alternates: { canonical: "/interview-qa/pass-by-value" },
  openGraph: {
    type: "article",
    url: "/interview-qa/pass-by-value",
    siteName: SITE_NAME,
    title: `Pass by value or by reference, step by step · ${SITE_NAME}`,
    description,
  },
};

export default function PassByValuePage() {
  const section = answer();

  return (
    <>
      <Breadcrumb
        section="Interview Q&A"
        sectionHref="/interview-qa"
        concept="Pass by value or by reference"
      />

      <div className={styles.page}>
        <div className={styles.inner}>
          <Hero eyebrow="JavaScript · practice" title="Pass by value or by reference">
            The answer first, written out the way you would say it in the room. Then two puzzles: fill
            in what each line prints, check it, and step through where every arrow points.
          </Hero>

          {section && (
            <>
              {/* Authored HTML from src/content, not user input. */}
              <div className={prep.prose} dangerouslySetInnerHTML={{ __html: section.html }} />
              <div id="prep-xref-tip" role="tooltip" hidden />
            </>
          )}

          <h2 className={styles.answerHead}>Now work it out: what does each line print?</h2>

          <PracticeTabs exercises={[EXERCISE, EXTRA]} />
        </div>
      </div>
    </>
  );
}
