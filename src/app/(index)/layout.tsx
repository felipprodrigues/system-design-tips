import styles from "./layout.module.css";

/* Route group: the URLs stay /, /about, /case-studies and /interview-qa. It
   exists so the top-level pages share one content column. */
export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
