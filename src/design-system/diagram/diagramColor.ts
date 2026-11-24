import { toneColor, type Tone } from "../tone";

export type DiagramColor = Tone | "border" | "border-strong";

export function diagramColor(color: DiagramColor): string {
  return color === "border" || color === "border-strong" ? `var(--sd-${color})` : toneColor(color);
}
