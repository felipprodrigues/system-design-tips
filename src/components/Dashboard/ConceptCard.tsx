import Link from "next/link";
import { STATUS_LABEL } from "@/lib/progress";
import type { ConceptProgress } from "@/lib/roadmap";
import styles from "./Dashboard.module.css";

/* Title and status, nothing else. The number, read time and description all live
   a click away on the page itself; repeating them here turned a scannable grid
   into fourteen paragraphs.

   Not-started carries no badge — an empty slot reads as "nothing here yet" faster
   than a row of grey "Not started" pills does. The status still reaches screen
   readers through the link's own label. */
export default function ConceptCard({ concept, status }: ConceptProgress) {
  return (
    <Link
      href={`/concepts/${concept.slug}`}
      className={styles.concept}
      data-status={status}
      aria-label={`${concept.title} — ${STATUS_LABEL[status]}, ${concept.minutes} min read`}
    >
      <span className={styles.conceptTitle}>{concept.title}</span>
      {status !== "todo" && (
        <span className={styles.badge} data-status={status} aria-hidden="true">
          {STATUS_LABEL[status]}
        </span>
      )}
    </Link>
  );
}
