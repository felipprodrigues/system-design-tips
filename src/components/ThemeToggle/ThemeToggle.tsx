"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.css";

type Theme = "dark" | "light";

// layout.tsx's inline script sets `<html data-theme>` from localStorage before
// hydration, so the attribute is the source of truth and React only reads it.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function read(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function readOnServer(): Theme {
  return "dark";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, readOnServer);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("sd-theme", next);
    } catch {
      // Storage unavailable: the change still holds for this page view.
    }
    for (const listener of listeners) listener();
  }

  return (
    <button className={styles.btn} onClick={toggle} aria-label="Toggle theme">
      {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}
