import Link from "next/link";
import type { ConceptEntry, ConceptNav } from "@/lib/concepts";
import styles from "./PageNav.module.css";

interface PageNavProps extends ConceptNav {
  label?: ConceptEntry["label"];
}

export default function PageNav({
  conceptNumber,
  totalConcepts,
  prevHref,
  nextHref,
  sectionTitle,
  label,
}: PageNavProps) {
  return (
    <nav className={styles.nav}>
      {prevHref ? (
        <Link href={prevHref} className={styles.btn}>
          ← Previous
        </Link>
      ) : (
        <button className={styles.btn} disabled>
          ← Previous
        </button>
      )}

      <div className={styles.center}>
        <strong>{label ?? `Concept ${conceptNumber} of ${totalConcepts}`}</strong>
        {sectionTitle}
      </div>

      {nextHref ? (
        <Link href={nextHref} className={styles.btn}>
          Next →
        </Link>
      ) : (
        <span className={styles.btn} style={{ visibility: "hidden" }} aria-hidden="true">
          Next →
        </span>
      )}
    </nav>
  );
}
