import { TopBar } from "@/components";
import styles from "./layout.module.css";

/* Route group: the URLs stay / and /case-studies. It exists so the two
   top-level pages share one shell and one set of controls. */
export default function IndexLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <TopBar />
        {children}
      </div>
    </div>
  );
}
