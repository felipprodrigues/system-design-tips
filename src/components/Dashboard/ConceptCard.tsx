import Link from "next/link";
import { STATUS_LABEL } from "@/lib/progress";
import type { ConceptProgress } from "@/lib/roadmap";
import StatusDot from "./StatusDot";
import styles from "./Dashboard.module.css";

export default function ConceptCard({ lesson, status }: ConceptProgress) {
  return (
    <Link href={`/concepts/${lesson.slug}`} className={styles.concept} data-status={status}>
      <StatusDot status={status} />
      <div className={styles.conceptBody}>
        <p className={styles.conceptNumber}>
          {String(lesson.number).padStart(2, "0")} · {lesson.minutes} min
        </p>
        <h3 className={styles.conceptTitle}>{lesson.title}</h3>
        <p className={styles.conceptDesc}>{lesson.description}</p>
        <p className={styles.conceptStatus}>{STATUS_LABEL[status]}</p>
      </div>
    </Link>
  );
}
