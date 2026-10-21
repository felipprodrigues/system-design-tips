import Link from "next/link";
import BuyMeACoffee from "../Support/BuyMeACoffee";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import TopTabs from "./TopTabs";
import styles from "./AppShell.module.css";

/* The persistent frame: one bar for the whole site, so nav lives in exactly one
   place instead of being re-rendered by every page's own header. Pages supply
   only their content. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <Link href="/" className={styles.brand}>
          System Design Bits
        </Link>

        <TopTabs />

        <div className={styles.controls}>
          <BuyMeACoffee />
          <ThemeToggle />
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
