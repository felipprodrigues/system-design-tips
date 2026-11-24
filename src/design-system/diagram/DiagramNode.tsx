import type { ReactNode } from "react";
import { diagramColor, type DiagramColor } from "./diagramColor";
import type { Rect } from "./types";

export interface DiagramNodeProps extends Rect {
  label: ReactNode;
  sub?: ReactNode;
  kind?: string;
  stroke?: DiagramColor;
  kindColor?: DiagramColor;
  emphasis?: boolean;
  dashed?: boolean;
  opacity?: number;
  rx?: number;
}

export function DiagramNode({
  x,
  y,
  w,
  h,
  label,
  sub,
  kind,
  stroke = "border-strong",
  kindColor = "muted",
  emphasis,
  dashed,
  opacity,
  rx = 9,
}: DiagramNodeProps) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const text = { textAnchor: "middle" as const, fontFamily: "var(--sd-font-mono)" };

  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill="var(--sd-surface2)"
        stroke={diagramColor(stroke)}
        strokeWidth={emphasis ? 2.5 : 1.5}
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      {kind ? (
        <>
          <text x={cx} y={cy - 9} {...text} fontSize="11" letterSpacing="1" fill={diagramColor(kindColor)}>
            {kind.toUpperCase()}
          </text>
          <text x={cx} y={cy + 14} {...text} fontSize="14" fontWeight="700" fill="var(--sd-text)">
            {label}
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={sub ? cy - 3 : cy + 4} {...text} fontSize="12" fontWeight="700" fill="var(--sd-text)">
            {label}
          </text>
          {sub && (
            <text x={cx} y={cy + 15} {...text} fontSize="10" fill="var(--sd-muted)">
              {sub}
            </text>
          )}
        </>
      )}
    </g>
  );
}
