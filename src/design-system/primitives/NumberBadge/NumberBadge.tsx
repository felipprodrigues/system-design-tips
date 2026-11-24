import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./NumberBadge.module.css";

export interface NumberBadgeProps extends HTMLAttributes<HTMLSpanElement>, Toned {
  size?: "xs" | "sm" | "md" | "lg";
  mono?: boolean;
}

export function NumberBadge({ size = "md", tone, mono = true, className, style, ...rest }: NumberBadgeProps) {
  return (
    <span
      className={clsx(styles.badge, styles[size], mono && styles.mono, className)}
      style={toneVars(tone, style)}
      data-tone={tone}
      {...rest}
    />
  );
}
