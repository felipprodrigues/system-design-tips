import React from "react";
import Link from "next/link";
import styles from "./Breadcrumb.module.css";

interface BreadcrumbProps {
  section: string;
  sectionHref?: string;
  lesson: string;
  action?: React.ReactNode;
}

export default function Breadcrumb({ section, sectionHref = "/", lesson, action }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb}>
      <div className={styles.left}>
        <Link href={sectionHref} className={styles.section}>
          {section}
        </Link>
        <span className={styles.sep}>›</span>
        <span className={styles.lesson}>{lesson}</span>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </nav>
  );
}
