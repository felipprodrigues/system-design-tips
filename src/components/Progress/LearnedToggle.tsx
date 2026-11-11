"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pages } from "@/lib/content";
import { markVisited, toggleLearned, useLearned } from "@/lib/progress";
import styles from "./LearnedToggle.module.css";

/* Rendered just before a page's lede and floated right, so it reads as part of the
   subtitle line. The slug comes from the path rather than a prop, so no body has to
   pass anything. A path that is neither a concept nor a listed page gets nothing.

   It also records the visit, because it is the one client component every page that
   counts towards the library already renders — a separate tracker would be a second
   component on all of them doing what this one can do in an effect. */

export default function LearnedToggle() {
  const pathname = usePathname();
  const learned = useLearned();

  const concept = pathname.startsWith("/concepts/") ? pathname.slice("/concepts/".length) : "";
  const slug = concept || (pages.find((page) => page.href === pathname)?.slug ?? "");

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
