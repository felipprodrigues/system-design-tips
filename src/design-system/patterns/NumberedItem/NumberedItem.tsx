import clsx from "clsx";
import type { ReactNode } from "react";
import { NumberBadge } from "../../primitives/NumberBadge/NumberBadge";
import type { Toned } from "../../types";
import styles from "./NumberedItem.module.css";

export interface NumberedItemProps extends Toned {
  num: ReactNode;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function NumberedItem({ num, title, children, tone, className }: NumberedItemProps) {
  return (
    <div className={clsx(styles.item, className)}>
      <div className={styles.head}>
        <NumberBadge size="lg" mono={false} tone={tone}>
          {num}
        </NumberBadge>
        <span className={styles.title}>{title}</span>
      </div>
      <p className="sd-text-xs">{children}</p>
    </div>
  );
}
