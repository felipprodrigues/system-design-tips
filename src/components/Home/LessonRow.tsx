"use client";

import Link from "next/link";
import type { LessonEntry } from "@/lib/lessons";
import { useLearned } from "@/lib/progress";
import styles from "./LessonRow.module.css";

export default function LessonRow({ lesson }: { lesson: LessonEntry }) {
  /* The check replaces the number rather than joining it, so a learned row reads
     differently without the 32px column reflowing. */
  const learned = useLearned().includes(lesson.slug);

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className={styles.row}
      data-learned={learned || undefined}
      aria-label={learned ? `${lesson.title} (learned)` : undefined}
    >
      <span className={styles.number}>
        {learned ? "✓" : String(lesson.number).padStart(2, "0")}
      </span>
      <span className={styles.title}>{lesson.title}</span>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </Link>
  );
}
