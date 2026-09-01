import React from "react";
import styles from "./PageLayout.module.css";

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <main className={styles.page}>
      {children}
    </main>
  );
}
