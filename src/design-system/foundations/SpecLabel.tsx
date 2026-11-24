import styles from "./Foundations.module.css";

export interface SpecLabelProps {
  title: string;
  detail: string;
}

export function SpecLabel({ title, detail }: SpecLabelProps) {
  return (
    <div className={styles.rowLabel}>
      <span className={styles.name}>{title}</span>
      <span className={styles.value}>{detail}</span>
    </div>
  );
}
