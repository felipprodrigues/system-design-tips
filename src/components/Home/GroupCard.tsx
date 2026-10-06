import type { LessonGroup } from "@/lib/lessons";
import LessonRow from "./LessonRow";
import styles from "./GroupCard.module.css";

interface GroupCardProps {
  group: LessonGroup;
  /** Topic tracks collapse; the on-ramp card stays open and has no toggle. */
  collapsible?: boolean;
}

export default function GroupCard({ group, collapsible = false }: GroupCardProps) {
  const rows = (
    <div className={styles.rows}>
      {group.lessons.map((lesson) => (
        <LessonRow key={lesson.slug} lesson={lesson} />
      ))}
    </div>
  );

  if (!collapsible) {
    return (
      <div className={styles.group}>
        <div className={styles.head}>{group.title}</div>
        {rows}
      </div>
    );
  }

  return (
    <details open className={styles.group}>
      <summary className={`${styles.head} ${styles.summary}`}>
        <span>{group.title}</span>
        <span className={styles.chevron} aria-hidden="true">▼</span>
      </summary>
      {rows}
    </details>
  );
}
