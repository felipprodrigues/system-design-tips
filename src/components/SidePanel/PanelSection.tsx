"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PanelSection.module.css";

interface PanelSectionProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** When this matches `id`, the section opens itself and scrolls into view. */
  activeId?: string | null;
}

export default function PanelSection({
  id,
  title,
  children,
  defaultOpen = false,
  activeId,
}: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [highlight, setHighlight] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  function expand() {
    const body = bodyRef.current;
    if (!body) return;
    body.style.height = body.scrollHeight + "px";
    body.addEventListener(
      "transitionend",
      () => {
        body.style.height = "auto";
        body.classList.add(styles.settled);
      },
      { once: true }
    );
    setOpen(true);
  }

  function toggle() {
    const body = bodyRef.current;
    if (!body) return;

    if (open) {
      body.classList.remove(styles.settled);
      body.style.height = body.scrollHeight + "px";
      requestAnimationFrame(() => { body.style.height = "0"; });
      setOpen(false);
    } else {
      expand();
    }
  }

  // `.body` is height: 0 in CSS and only ever opened by the inline height that
  // expand() sets, so a defaultOpen section rendered as open-but-zero-height.
  // Land it in the same end state expand() does, once, on mount.
  useEffect(() => {
    if (!defaultOpen || !bodyRef.current) return;
    bodyRef.current.style.height = "auto";
    bodyRef.current.classList.add(styles.settled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id || activeId !== id) return;
    if (!open) expand();
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlight(true);
    const t = setTimeout(() => setHighlight(false), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, id]);

  return (
    <div
      id={id}
      ref={rootRef}
      className={`${styles.section} ${open ? styles.open : ""} ${highlight ? styles.highlight : ""}`}
    >
      <button className={styles.head} onClick={toggle}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.chevron}>▾</span>
      </button>
      <div className={styles.body} ref={bodyRef}>
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}
