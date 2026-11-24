import clsx from "clsx";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps extends Toned {
  value: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, tone, label, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  const a11y = label
    ? { role: "progressbar", "aria-label": label, "aria-valuenow": percent, "aria-valuemin": 0, "aria-valuemax": 100 }
    : { "aria-hidden": true };

  return (
    <span className={clsx(styles.track, className)} style={toneVars(tone)} {...a11y}>
      <span className={styles.fill} style={{ width: `${percent}%` }} />
    </span>
  );
}
