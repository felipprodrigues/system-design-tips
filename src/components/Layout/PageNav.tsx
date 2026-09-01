import Link from "next/link";
import styles from "./PageNav.module.css";

interface PageNavProps {
  lessonNumber: number;
  totalLessons: number;
  prevHref?: string;
  nextHref?: string;
  sectionTitle: string;
}

export default function PageNav({
  lessonNumber,
  totalLessons,
  prevHref,
  nextHref,
  sectionTitle,
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
        <strong>Lesson {lessonNumber} of {totalLessons}</strong>
        {sectionTitle}
      </div>

      {nextHref ? (
        <Link href={nextHref} className={styles.btn}>
          Next →
        </Link>
      ) : (
        <button className={styles.btn} disabled>
          Next →
        </button>
      )}
    </nav>
  );
}
