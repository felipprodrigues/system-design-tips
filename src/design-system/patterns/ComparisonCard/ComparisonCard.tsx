import clsx from "clsx";
import type { ReactNode } from "react";
import { toneVars } from "../../tone";
import { DotList } from "../DotList/DotList";
import type { Toned } from "../../types";
import styles from "./ComparisonCard.module.css";

export interface ComparisonCardProps extends Toned {
  label: ReactNode;
  points?: ReactNode[];
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ComparisonCard({ label, tone = "accent", points, children, footer, className }: ComparisonCardProps) {
  return (
    <div className={clsx(styles.card, className)} style={toneVars(tone)}>
      <div className={styles.head}>{label}</div>
      <div className={styles.body}>
        {points && <DotList items={points} tone={tone} />}
        {children}
      </div>
      {footer != null && <div className={styles.foot}>{footer}</div>}
    </div>
  );
}
