import styles from "./layout.module.css";

/* Route group: the URLs stay / and /case-studies. It exists so the two
   top-level pages share one content column. Nav and controls live in the
   app-wide sidebar, not here. */
export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
