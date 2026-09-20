import type { ReactNode } from "react";

interface MarkerListProps {
  /** Glyph in the gutter — ▸ for motivation, ▪ for examples, ✓ / ✕ for takeaways. */
  mark: string;
  color: string;
  items: ReactNode[];
  /** Override the card background, e.g. a danger wash for mistakes. */
  bg?: string;
  /** 2 lays the cards out in a grid instead of a single column. */
  columns?: 1 | 2;
}

export default function MarkerList({ mark, color, items, bg = "var(--sd-surface2)", columns = 1 }: MarkerListProps) {
  return (
    <div className={columns === 2 ? "sd-grid-2" : "sd-stack"}>
      {items.map((text, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: bg, border: "1px solid var(--sd-border)", borderRadius: 10, padding: "13px 16px" }}>
          <span style={{ flexShrink: 0, fontFamily: "var(--sd-font-mono)", fontSize: 13, lineHeight: 1.65, color }}>{mark}</span>
          <p className="sd-text-sm-tight">{text}</p>
        </div>
      ))}
    </div>
  );
}
