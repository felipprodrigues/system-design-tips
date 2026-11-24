import clsx from "clsx";
import type { HTMLAttributes } from "react";
import type { TextTag } from "../../types";

const VARIANT_CLASS = {
  lede: "sd-lede",
  sm: "sd-text-sm",
  "sm-tight": "sd-text-sm-tight",
  xs: "sd-text-xs",
} as const;

export type TextVariant = keyof typeof VARIANT_CLASS;

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextTag;
}

export function Text({ variant = "sm", as: Tag = "p", className, ...rest }: TextProps) {
  return <Tag className={clsx(VARIANT_CLASS[variant], className)} {...rest} />;
}

export function Strong({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <strong className={clsx("sd-strong", className)} {...rest} />;
}

const HIGHLIGHT_CLASS = {
  teal: "sd-hl",
  accent: "sd-hl-accent",
  amber: "sd-hl-amber",
  muted: "sd-hl-muted",
} as const;

export type HighlightTone = keyof typeof HIGHLIGHT_CLASS;

export interface HighlightProps extends HTMLAttributes<HTMLElement> {
  tone?: HighlightTone;
  as?: "span" | "strong";
}

export function Highlight({ tone = "teal", as: Tag = "span", className, ...rest }: HighlightProps) {
  return <Tag className={clsx(HIGHLIGHT_CLASS[tone], className)} {...rest} />;
}
