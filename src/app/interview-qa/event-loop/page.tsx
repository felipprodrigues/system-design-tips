import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Breadcrumb, Hero } from "@/components";
import prep from "@/components/InterviewPrep/PrepBrowser.module.css";
import { parseSections } from "@/lib/interviewPrep";
import { SITE_NAME } from "@/lib/seo";
import EventLoopPractice from "./EventLoopPractice";
import styles from "./eventLoop.module.css";
import { EXERCISES } from "./exercises";

/* §13 gets a page of its own rather than the dialog every other question opens
   in: the board and the step-through both need room, and both need to sit under
   the written answer they are practice for. See PRACTICE in PrepBrowser.

   Outside the (index) group, like /case-studies: the breadcrumb has to sit above
   the content column, flush under the navbar, so this page brings its own. */
const SECTION = "s13";

function answer() {
  const sections = parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  );
  return sections.find((section) => section.id === SECTION);
}

const description =
  "The event loop answered in full, then four snippets to practise output order on, each with a step-through of the call stack, both queues and the console.";

export const metadata: Metadata = {
  title: "The event loop, step by step",
  description,
  alternates: { canonical: "/interview-qa/event-loop" },
  openGraph: {
    type: "article",
    url: "/interview-qa/event-loop",
    siteName: SITE_NAME,
    title: `The event loop, step by step · ${SITE_NAME}`,
    description,
  },
};

export default function EventLoopPage() {
  const section = answer();

  return (
    <>
      <Breadcrumb section="Interview Q&A" sectionHref="/interview-qa" concept="The event loop" />

      <div className={styles.page}>
        <div className={styles.inner}>
          <Hero eyebrow="JavaScript · practice" title="The event loop and execution order">
            The answer first, written out the way you would say it in the room. Then{" "}
            {EXERCISES.length}{" "}
            snippets to practise on: place each output in the slot for the turn it prints on,
            check it, and step through what the queues were doing.
          </Hero>

          {section && (
            <>
              {/* Authored HTML from src/content, not user input. */}
              <div className={prep.prose} dangerouslySetInnerHTML={{ __html: section.html }} />
              {/* The cross-references in that prose carry aria-describedby; the bubble
                  that fills it is in the dialog, so here it resolves to an empty one. */}
              <div id="prep-xref-tip" role="tooltip" hidden />
            </>
          )}

          <h2 className={styles.answerHead}>Now work one out: in what order does it print?</h2>

          <EventLoopPractice exercises={EXERCISES} />
        </div>
      </div>
    </>
  );
}
