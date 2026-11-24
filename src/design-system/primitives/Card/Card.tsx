import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { toneVars } from "../../tone";
import type { Toned } from "../../types";
import styles from "./Card.module.css";

const VARIANT_CLASS = {
  card: "sd-card",
  panel: "sd-panel-card",
} as const;

export type CardVariant = keyof typeof VARIANT_CLASS;

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title">, Toned {
  variant?: CardVariant;
  title?: ReactNode;
}

export function Card({ variant = "card", title, tone, className, style, children, ...rest }: CardProps) {
  return (
    <div className={clsx(VARIANT_CLASS[variant], className)} style={toneVars(tone, style)} {...rest}>
      {title != null && (
        <div className={variant === "panel" ? clsx("sd-panel-card-title", tone && styles.toned) : styles.title}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
