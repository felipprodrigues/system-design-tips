import Link from "next/link";
import BuyMeACoffee from "../Support/BuyMeACoffee";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import SidebarNav from "./SidebarNav";
import styles from "./AppShell.module.css";

/* The persistent frame: one sidebar for the whole site, so nav lives in exactly
   one place instead of being re-rendered by every page's own header. Pages
   supply only their content. Below 900px the sidebar becomes a horizontal strip
   at the top rather than a drawer — four links fit, and a drawer would be a
   toggle, a focus trap and an overlay for no gain. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <svg viewBox="0 0 20 20" className={styles.brandMark} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 2.5 16.5 6v8L10 17.5 3.5 14V6L10 2.5Z" />
            <path d="M10 10v7.5M10 10 3.5 6M10 10l6.5-4" />
          </svg>
          System Design Bits
        </Link>

        <SidebarNav />

        <div className={styles.footer}>
          <div className={styles.controls}>
            <BuyMeACoffee />
            <ThemeToggle />
          </div>
          <p className={styles.note}>Local only · no accounts</p>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
