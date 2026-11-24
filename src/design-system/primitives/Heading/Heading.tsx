import clsx from "clsx";
import type { HTMLAttributes } from "react";

const LEVEL = {
  page: { className: "sd-h1", tag: "h1" },
  section: { className: "sd-h2", tag: "h2" },
} as const;

export type HeadingLevel = keyof typeof LEVEL;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  as?: "h1" | "h2" | "h3" | "h4";
}

export function Heading({ level = "section", as, className, ...rest }: HeadingProps) {
  const Tag = as ?? LEVEL[level].tag;
  return <Tag className={clsx(LEVEL[level].className, className)} {...rest} />;
}
