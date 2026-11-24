import type { CSSProperties, ReactNode } from "react";

export interface DiagramProps {
  viewBox: string;
  label: string;
  title?: string;
  minWidth?: number;
  interactive?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/* minWidth stops labels shrinking below legibility; the svg overflows instead, so
   wrap it in <Figure scroll>. */
export function Diagram({ viewBox, label, title, minWidth = 620, interactive, children, className, style }: DiagramProps) {
  return (
    <svg
      viewBox={viewBox}
      role={interactive ? "group" : "img"}
      aria-label={label}
      className={className}
      style={{ width: "100%", minWidth, display: "block", ...style }}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}
