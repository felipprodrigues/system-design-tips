"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppShell.module.css";

/* Every destination the site actually has. `owns` decides which one is lit.
   Roadmap owns /concepts too: the dashboard is the concept index, so reading one
   keeps its parent highlighted. A standalone /concepts list gets its own entry
   when it exists. */
const LINKS = [
  { href: "/", label: "Roadmap", owns: (p: string) => p === "/" || p.startsWith("/concepts") },
  { href: "/walkthrough", label: "The Method", owns: (p: string) => p.startsWith("/walkthrough") },
  { href: "/case-studies", label: "Case studies", owns: (p: string) => p.startsWith("/case-studies") },
];

export default function TopTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabs} aria-label="Sections">
      {LINKS.map((link) => {
        const active = link.owns(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={styles.tab}
            data-active={active || undefined}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
