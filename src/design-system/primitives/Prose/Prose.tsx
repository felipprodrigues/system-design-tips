import clsx from "clsx";
import type { HTMLAttributes } from "react";
import styles from "./Prose.module.css";

export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  size?: "md" | "lg";
}

export function Prose({ size = "md", className, ...rest }: ProseProps) {
  return <div className={clsx("sd-prose", styles.prose, size === "lg" && styles.lg, className)} {...rest} />;
}
