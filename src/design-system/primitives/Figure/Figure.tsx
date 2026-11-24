import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Figure.module.css";

export interface FigureProps extends HTMLAttributes<HTMLElement> {
  caption?: ReactNode;
  scroll?: boolean;
  flush?: boolean;
}

export function Figure({ caption, scroll, flush, className, children, ...rest }: FigureProps) {
  return (
    <figure className={clsx("sd-figure", scroll && styles.scroll, flush && styles.flush, className)} {...rest}>
      {caption != null && <figcaption className="sd-figure-caption">{caption}</figcaption>}
      {children}
    </figure>
  );
}
