import clsx from "clsx";
import type { ReactNode } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./DefinitionList.module.css";

export interface Definition {
  title: ReactNode;
  def: ReactNode;
}

export interface DefinitionListProps extends Toned {
  items: Definition[];
  className?: string;
}

export function DefinitionList({ items, tone, className }: DefinitionListProps) {
  return (
    <dl className={clsx("sd-stack", className)} style={toneVars(tone)}>
      {items.map((item, i) => (
        <div key={i} className="sd-card">
          <dt className={styles.term}>{item.title}</dt>
          <dd className="sd-text-sm-tight">{item.def}</dd>
        </div>
      ))}
    </dl>
  );
}
