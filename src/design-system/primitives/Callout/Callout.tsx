import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { toneVars, type Tone } from "../../tone";
import type { Toned } from "../../types";
import styles from "./Callout.module.css";

const LEGACY_CLASS: Partial<Record<Tone | "neutral", string>> = {
  neutral: "sd-callout",
  accent: "sd-callout sd-callout-accent",
  green: "sd-callout sd-callout-green",
};

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone | "neutral";
}

export function Callout({ tone = "neutral", className, style, ...rest }: CalloutProps) {
  const legacy = LEGACY_CLASS[tone];
  if (legacy) return <div className={clsx(legacy, className)} style={style} {...rest} />;

  return (
    <div
      className={clsx("sd-callout", styles.toned, className)}
      style={toneVars(tone as Tone, style)}
      data-tone={tone}
      {...rest}
    />
  );
}

export type PanelNoteProps = HTMLAttributes<HTMLDivElement> & Toned;

export function PanelNote({ tone = "accent", className, style, ...rest }: PanelNoteProps) {
  if (tone === "accent") return <div className={clsx("sd-panel-note", className)} style={style} {...rest} />;

  return (
    <div
      className={clsx("sd-panel-note", styles.toned, className)}
      style={toneVars(tone, style)}
      data-tone={tone}
      {...rest}
    />
  );
}
