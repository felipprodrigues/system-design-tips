import clsx from "clsx";
import type { ReactNode } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./DotList.module.css";

export interface DotListProps extends Toned {
  items: ReactNode[];
  className?: string;
}

export function DotList({ items, tone, className }: DotListProps) {
  return (
    <ul className={clsx(styles.list, className)} style={toneVars(tone)}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.dot} aria-hidden="true">
            ●
          </span>
          <p className="sd-text-sm-tight">{item}</p>
        </li>
      ))}
    </ul>
  );
}
