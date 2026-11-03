"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { markSeen, useSeen } from "@/lib/progress";
import styles from "./AppShell.module.css";

/* Announces one new section, once. The key carries the announcement's identity:
   bump it when there is something new to say and everyone sees the notice again.

   Whether it has been seen exists only in localStorage, so useSeen reports
   "seen" server-side: the notice can appear only after the browser has said it
   was never dismissed. Nothing renders during SSR, and nothing mismatches. */
const KEY = "sd-announced-interview-qa";
const HREF = "/interview-qa";
const VISIBLE_MS = 10_000;

export default function NewContentToast() {
  const pathname = usePathname();
  const seen = useSeen(KEY);
  const [hidden, setHidden] = useState(false);

  // Nothing to announce to someone already reading the thing being announced.
  const open = !seen && !hidden && !pathname.startsWith(HREF);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setHidden(true), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [open]);

  /* Auto-hiding is not dismissal: letting it time out leaves it to show once
     more next visit, while clicking anything on it retires it for good. */
  function dismiss() {
    setHidden(true);
    markSeen(KEY);
  }

  if (!open) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <div className={styles.toastHead}>
        <span className={styles.toastEyebrow}>New content just arrived</span>
        <button
          type="button"
          className={styles.toastClose}
          onClick={dismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      <p className={styles.toastBody}>
        <strong>Frontend interview Q&amp;A</strong> — 57 questions on JavaScript, React and
        performance, each answered in full. Star the ones you want to come back to.
      </p>

      <div className={styles.toastActions}>
        <Link href={HREF} className={styles.toastPrimary} onClick={dismiss}>
          Check it out
        </Link>
      </div>
    </div>
  );
}
