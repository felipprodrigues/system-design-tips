import type { Tone } from "./tone";

export interface Toned {
  tone?: Tone;
}

export type TextTag = "p" | "span" | "div";
