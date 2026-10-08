"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./TopNav.module.css";

/* The two top-level sections. Lessons is the roadmap index at the root; anything
   under /lessons belongs to it too, so a lesson page keeps the tab lit. */
const TABS = [
  { href: "/", label: "Lessons", owns: (path: string) => path === "/" || path.startsWith("/lessons") },
  { href: "/case-studies", label: "Case studies", owns: (path: string) => path.startsWith("/case-studies") },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Sections">
      {TABS.map((tab) => {
        const active = tab.owns(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={styles.tab}
            data-active={active || undefined}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
