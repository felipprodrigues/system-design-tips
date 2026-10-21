"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markVisited, toggleLearned, useLearned } from "@/lib/progress";
import styles from "./LearnedToggle.module.css";

/* Rendered just before each lesson's lede and floated right, so it reads as part of
   the subtitle line. The slug comes from the path rather than a prop, so no lesson
   body has to pass anything. Anything that isn't a lesson page gets nothing.

   It also records the visit, because it is the one client component every concept
   page already renders — a separate tracker would be a second component on all
   fourteen pages doing what this one can do in an effect. */

export default function LearnedToggle() {
  const pathname = usePathname();
  const learned = useLearned();

  const slug = pathname.startsWith("/concepts/") ? pathname.slice("/concepts/".length) : "";

  useEffect(() => {
    if (slug) markVisited(slug);
  }, [slug]);

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
