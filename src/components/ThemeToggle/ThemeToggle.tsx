"use client";

import { useLayoutEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  // Always starts "dark" so the first client render matches the server
  // render exactly (server has no window/localStorage to read from).
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // On mount, adopt whatever the inline beforeInteractive script already
  // set on <html> (it read localStorage before hydration) — runs before
  // paint, so there's no visible flash of the wrong icon.
  useLayoutEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light") setTheme("light");
  }, []);

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
