import type { GroupProgress } from "@/lib/roadmap";
import ConceptCard from "./ConceptCard";
import styles from "./Dashboard.module.css";

interface SectionCardProps {
  section: GroupProgress;
  /** Finished sections start closed; there is nothing left to do in them. */
  open: boolean;
}

/* <details> rather than useState: the browser owns the open/closed state, which
   means it works before hydration and needs no JavaScript to toggle. */
export default function SectionCard({ section, open }: SectionCardProps) {
  return (
    <details className={styles.section} open={open}>
      <summary className={styles.sectionHead}>
        <svg viewBox="0 0 16 16" className={styles.chevron} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
        <span className={styles.sectionTitle}>{section.title}</span>
        <span className={styles.bar} aria-hidden="true">
          <span className={styles.barFill} style={{ width: `${section.percent}%` }} />
        </span>
        <span className={styles.sectionCount}>
          {section.done}/{section.total}
        </span>
      </summary>

      <div className={styles.conceptGrid}>
        {section.concepts.map((concept) => (
          <ConceptCard key={concept.lesson.slug} {...concept} />
        ))}
      </div>
    </details>
  );
}
