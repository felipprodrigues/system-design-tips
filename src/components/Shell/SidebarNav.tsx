"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppShell.module.css";

/* Every destination the site actually has. `owns` decides which one is lit.
   Roadmap owns /concepts too: the dashboard is the concept index, so reading one
   keeps its parent highlighted. A standalone /concepts list gets its own entry
   when it exists. */
const LINKS = [
  { href: "/", label: "Roadmap", icon: "home", owns: (p: string) => p === "/" || p.startsWith("/concepts") },
  { href: "/walkthrough", label: "The Method", icon: "compass", owns: (p: string) => p.startsWith("/walkthrough") },
  { href: "/case-studies", label: "Case studies", icon: "archive", owns: (p: string) => p.startsWith("/case-studies") },
];

/* Inline so the sidebar costs no icon dependency and the strokes inherit
   currentColor, which is what makes the active state a single colour change. */
const ICONS: Record<string, React.ReactNode> = {
  home: <><path d="M3 9.5 10 4l7 5.5" /><path d="M5 8.5V16h10V8.5" /></>,
  compass: <><circle cx="10" cy="10" r="7" /><path d="m13 7-2 4-4 2 2-4 4-2Z" /></>,
  archive: <><rect x="3" y="4" width="14" height="4" rx="1" /><path d="M4.5 8v7a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8" /><path d="M8 11h4" /></>,
};

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Sections">
      {LINKS.map((link) => {
        const active = link.owns(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
            data-active={active || undefined}
            aria-current={active ? "page" : undefined}
          >
            <svg
              viewBox="0 0 20 20"
              className={styles.icon}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[link.icon]}
            </svg>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
