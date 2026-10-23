import styles from "./Concept.module.css";

interface ConceptLayoutProps {
  children: React.ReactNode;
  rail: React.ReactNode;
}

/* Content column plus a sticky rail. Separate from PageLayout, which the
   walkthrough and other single-column pages still use unchanged. The content
   wrapper is a div, not a main: AppShell already renders the page's main, and
   below 1040px this wrapper becomes `display: contents` so the rail can slot in
   above the closing quiz. */
export default function ConceptLayout({ children, rail }: ConceptLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.content}>{children}</div>
      {rail}
    </div>
  );
}
