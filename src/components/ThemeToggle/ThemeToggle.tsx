"use client";

import { useLayoutEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("sd-theme") as "dark" | "light" | null) ?? "dark";
  });

  // Keeps the <html> attribute in sync with state — also re-applies it after
  // React's dev Strict-Mode remount clears what the inline script set.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("sd-theme", next);
  }

  return (
    <button className={styles.btn} onClick={toggle} aria-label="Toggle theme">
      {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}
