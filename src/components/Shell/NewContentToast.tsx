"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { markSeen, useSeen } from "@/lib/progress";
import { latestRelease } from "@/lib/releases";
import styles from "./AppShell.module.css";

/* One notice, for the newest thing that shipped — see src/lib/releases.ts. Its
   identity is the href, so appending a release is the whole act of announcing it.

   Whether one has been seen exists only in localStorage, so useSeen reports
   "seen" server-side: a notice can appear only after the browser has said it was
   never dismissed. Nothing renders during SSR, and nothing mismatches. */
const VISIBLE_MS = 10_000;

export default function NewContentToast() {
  const { href, title, body } = latestRelease;
  const key = `sd-announced:${href}`;
  const pathname = usePathname();
  const seen = useSeen(key);
  const [hidden, setHidden] = useState(false);

  // Nothing to announce to someone already reading the thing being announced.
  const open = !seen && !hidden && !pathname.startsWith(href);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setHidden(true), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [open]);

  /* Auto-hiding is not dismissal: letting it time out leaves it to show once
     more next visit, while clicking anything on it retires it for good. */
  function dismiss() {
    setHidden(true);
    markSeen(key);
  }

  if (!open) return null;

  return (
    <div className={styles.toastStack}>
      <div className={styles.toast} role="status" aria-live="polite">
        <div className={styles.toastHead}>
          <span className={styles.toastEyebrow}>New content just arrived</span>
          <button
            type="button"
            className={styles.toastClose}
            onClick={dismiss}
            aria-label={`Dismiss: ${title}`}
          >
            ✕
          </button>
        </div>

        <p className={styles.toastBody}>
          <strong>{title}</strong>
        </p>
        <p className={styles.toastBody} style={{ marginTop: 4 }}>
          {body}
        </p>

        <div className={styles.toastActions}>
          <Link href={href} className={styles.toastPrimary} onClick={dismiss}>
            Check it out
          </Link>
        </div>
      </div>
    </div>
  );
}
