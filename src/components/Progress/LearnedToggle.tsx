"use client";

import { usePathname } from "next/navigation";
import { toggleLearned, useLearned } from "@/lib/progress";
import styles from "./LearnedToggle.module.css";

/* Rendered just before each lesson's lede and floated right, so it reads as part of
   the subtitle line. The slug comes from the path rather than a prop, so no lesson
   body has to pass anything. Anything that isn't a lesson page gets nothing. */

export default function LearnedToggle() {
  const pathname = usePathname();
  const learned = useLearned();

  const slug = pathname.startsWith("/lessons/") ? pathname.slice("/lessons/".length) : "";
  if (!slug) return null;

  const done = learned.includes(slug);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-pressed={done}
      data-done={done || undefined}
      onClick={() => toggleLearned(slug)}
    >
      {done && <span className={styles.mark} aria-hidden="true">✓</span>}
      {done ? "Completed" : "Complete"}
    </button>
  );
}
