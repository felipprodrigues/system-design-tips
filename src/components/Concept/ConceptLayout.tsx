import styles from "./Concept.module.css";

interface ConceptLayoutProps {
  children: React.ReactNode;
  rail: React.ReactNode;
}

/* Content column plus a sticky rail. Separate from PageLayout, which the
   walkthrough and other single-column pages still use unchanged. */
export default function ConceptLayout({ children, rail }: ConceptLayoutProps) {
  return (
    <div className={styles.layout}>
      <main className={styles.content}>{children}</main>
      {rail}
    </div>
  );
}
