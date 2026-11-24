import type { CSSProperties } from "react";

export const TONES = [
  "accent",
  "teal",
  "green",
  "amber",
  "red",
  "done",
  "warm",
  "violet",
  "pink",
  "danger",
  "muted",
  "text",
] as const;

export type Tone = (typeof TONES)[number];

const WASH_TOKEN: Partial<Record<Tone, string>> = {
  accent: "var(--sd-accent-wash)",
  done: "var(--sd-done-wash)",
  warm: "var(--sd-warm-wash)",
  violet: "var(--sd-violet-wash)",
  pink: "var(--sd-pink-wash)",
  danger: "var(--sd-danger-wash)",
};

export function toneColor(tone: Tone): string {
  return `var(--sd-${tone})`;
}

/* 12% is the alpha of the rgba() washes hardcoded in the concept pages, so a
   migrated call site keeps its dark-mode colour. */
export function toneWash(tone: Tone): string {
  return WASH_TOKEN[tone] ?? `color-mix(in srgb, ${toneColor(tone)} 12%, transparent)`;
}

export function toneVars(tone: Tone | undefined, style?: CSSProperties): CSSProperties | undefined {
  if (!tone) return style;
  return {
    "--ds-tone": toneColor(tone),
    "--ds-tone-wash": toneWash(tone),
    ...style,
  } as CSSProperties;
}
