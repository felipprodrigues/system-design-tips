import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { toneColor } from "../../tone";
import type { TextTag, Toned } from "../../types";

const VARIANT_CLASS = {
  section: "sd-eyebrow",
  accent: "sd-eyebrow-accent",
  sub: "sd-eyebrow-sub",
} as const;

export type EyebrowVariant = keyof typeof VARIANT_CLASS;

export interface EyebrowProps extends HTMLAttributes<HTMLElement>, Toned {
  variant?: EyebrowVariant;
  as?: TextTag;
}

export function Eyebrow({ variant = "section", tone, as: Tag = "p", className, style, ...rest }: EyebrowProps) {
  return (
    <Tag
      className={clsx(VARIANT_CLASS[variant], className)}
      style={tone ? { color: toneColor(tone), ...style } : style}
      {...rest}
    />
  );
}
