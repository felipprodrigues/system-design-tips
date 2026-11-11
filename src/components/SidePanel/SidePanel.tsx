"use client";

import { useEffect, useRef } from "react";
import styles from "./SidePanel.module.css";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}

export default function SidePanel({
  open,
  onClose,
  eyebrow = "Deep Dive",
  title,
  children,
}: SidePanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* On the documentElement, not the body: the stylesheet sets overflow-x on
     html, which stops the body's overflow from propagating to the viewport, so
     locking the body here would leave the page scrolling behind the panel. */
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={onClose}
      />
      <aside className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <p className={styles.title}>{title}</p>
          </div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body} ref={bodyRef}>
          {children}
        </div>
      </aside>
    </>
  );
}
