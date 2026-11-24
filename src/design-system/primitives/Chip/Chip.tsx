import clsx from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./Chip.module.css";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement>, Toned {
  pressed?: boolean;
  count?: number;
}

export function Chip({ pressed, count, tone, className, style, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={clsx(styles.chip, className)}
      style={toneVars(tone, style)}
      {...rest}
    >
      {children}
      {count != null && (
        <>
          {" "}
          <span className={styles.count}>{count}</span>
        </>
      )}
    </button>
  );
}

export interface ChipGroupProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function ChipGroup({ label, className, ...rest }: ChipGroupProps) {
  return <div role="group" aria-label={label} className={clsx(styles.group, className)} {...rest} />;
}
