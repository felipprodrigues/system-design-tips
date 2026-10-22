import Link from "next/link";
import styles from "./Breadcrumb.module.css";

interface BreadcrumbProps {
  section: string;
  sectionHref?: string;
  concept: string;
}

export default function Breadcrumb({ section, sectionHref = "/", concept }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb}>
      <div className={styles.left}>
        <Link href={sectionHref} className={styles.section}>
          {section}
        </Link>
        <span className={styles.sep}>›</span>
        <span className={styles.concept}>{concept}</span>
      </div>
    </nav>
  );
}
