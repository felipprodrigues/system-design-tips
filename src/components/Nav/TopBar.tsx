import ThemeToggle from "../ThemeToggle/ThemeToggle";
import TopNav from "./TopNav";
import styles from "./TopBar.module.css";

/* The page-level controls, in one place. Lesson pages render the same nav and
   toggle inside their sticky breadcrumb instead, so they do not use this shell. */
export default function TopBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.nav}>
        <TopNav />
      </div>
      <div className={styles.controls}>
        <ThemeToggle />
      </div>
    </div>
  );
}
