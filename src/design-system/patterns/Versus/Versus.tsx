import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./Versus.module.css";

export interface VersusProps {
  left: ReactNode;
  right: ReactNode;
  label?: ReactNode;
  className?: string;
}

export function Versus({ left, right, label = "VS", className }: VersusProps) {
  return (
    <div className={clsx(styles.grid, className)}>
      {left}
      <div className={styles.divider}>
        <span>{label}</span>
      </div>
      {right}
    </div>
  );
}
