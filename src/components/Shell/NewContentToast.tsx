"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { markSeen, useSeen } from "@/lib/progress";
import styles from "./AppShell.module.css";

/* Announcements stack, newest first, and each one is dismissed on its own — a
   reader who already clicked through to the Q&A still gets told about the
   capstone. `key` carries an announcement's identity: bump it when there is
   something new to say and everyone sees that notice again.

   Whether one has been seen exists only in localStorage, so useSeen reports
   "seen" server-side: a notice can appear only after the browser has said it was
   never dismissed. Nothing renders during SSR, and nothing mismatches. */
interface Announcement {
  key: string;
  href: string;
  title: string;
  body: string;
}

const announcements: Announcement[] = [
  {
    key: "sd-announced-backend-around-one-message",
    href: "/concepts/backend-around-one-message",
    title: "System Design 101 has a second capstone",
    body: "Follow one chat message end to end and watch a backend assemble around it, one piece at a time.",
  },
  {
    key: "sd-announced-interview-qa",
    href: "/interview-qa",
    title: "Frontend interview Q&A",
    body: "57 questions on JavaScript, React and performance, each answered in full. Star the ones you want to come back to.",
  },
];

const VISIBLE_MS = 10_000;

/* One notice. A component rather than a loop in the parent, so each gets its own
   useSeen and its own timer without calling hooks inside a map. */
function Notice({ announcement }: { announcement: Announcement }) {
  const { key, href, title, body } = announcement;
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
        <strong>{title}</strong> &mdash; {body}
      </p>

      <div className={styles.toastActions}>
        <Link href={href} className={styles.toastPrimary} onClick={dismiss}>
          Check it out
        </Link>
      </div>
    </div>
  );
}

export default function NewContentToast() {
  return (
    <div className={styles.toastStack}>
      {announcements.map((a) => (
        <Notice key={a.key} announcement={a} />
      ))}
    </div>
  );
}
