import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./Badge.module.css";

export type BadgeVariant = "tag" | "outline" | "pill";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, Toned {
  variant?: BadgeVariant;
}

export function Badge({ variant = "tag", tone, className, style, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(styles.badge, styles[variant], className)}
      style={toneVars(tone, style)}
      data-variant={variant}
      data-tone={tone}
      {...rest}
    />
  );
}
