import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { Breadcrumb, Hero } from "@/design-system";
import prep from "@/components/InterviewPrep/PrepBrowser.module.css";
import { parseSections } from "@/lib/interviewPrep";
import { SITE_NAME } from "@/lib/seo";
import styles from "../event-loop/eventLoop.module.css";
import ClosurePractice from "../closures/ClosurePractice";
import { EXERCISE } from "./exercise";

/* §40, §41, §43 and §44 share one page and one puzzle: the snippet only makes
   sense with all four collections side by side. Same reasons as
   /interview-qa/event-loop otherwise. */
const SECTIONS = ["s40", "s41", "s43", "s44"];

function answers() {
  const sections = parseSections(
    readFileSync(join(process.cwd(), "src/content/interview-qa.html"), "utf8"),
  );
  return sections.filter((section) => SECTIONS.includes(section.id));
}

const description =
  "Set, Map, WeakMap and WeakSet answered in full, then one puzzle across all four: what does each console.log print, with a step-through of every collection.";

export const metadata: Metadata = {
  title: "Set, Map, WeakMap and WeakSet, step by step",
  description,
  alternates: { canonical: "/interview-qa/set-map-weakmap-weakset" },
  openGraph: {
    type: "article",
    url: "/interview-qa/set-map-weakmap-weakset",
    siteName: SITE_NAME,
    title: `Set, Map, WeakMap and WeakSet, step by step · ${SITE_NAME}`,
    description,
  },
};

export default function CollectionsPage() {
  return (
    <>
      <Breadcrumb
        section="Interview Q&A"
        sectionHref="/interview-qa"
        concept="Set, Map, WeakMap, WeakSet"
      />

      <div className={styles.page}>
        <div className={styles.inner}>
          <Hero eyebrow="JavaScript · practice" title="Set, Map, WeakMap, WeakSet">
            Four answers first, written out the way you would say them in the room. Then one puzzle
            across all four: fill in what each line prints, check it, and step through what each
            collection holds.
          </Hero>

          {answers().map((section) => (
            <section key={section.id}>
              <h2 className={styles.answerHead}>{section.title}</h2>
              {/* Authored HTML from src/content, not user input. */}
              <div className={prep.prose} dangerouslySetInnerHTML={{ __html: section.html }} />
            </section>
          ))}
          <div id="prep-xref-tip" role="tooltip" hidden />

          <h2 className={styles.answerHead}>Now work it out: what does each line print?</h2>

          <ClosurePractice exercise={EXERCISE} />
        </div>
      </div>
    </>
  );
}
