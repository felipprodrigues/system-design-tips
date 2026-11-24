import styles from "./layout.module.css";

/* Route group: the URL stays /. It exists so the top-level pages under it share
   one content column. Nav and controls live in the app-wide sidebar, not here. */
export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
