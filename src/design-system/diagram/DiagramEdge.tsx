import type { ReactNode } from "react";
import { diagramColor, type DiagramColor } from "./diagramColor";

export interface DiagramEdgeProps {
  d: string;
  markerId?: string;
  label?: ReactNode;
  lx?: number;
  ly?: number;
  stroke?: DiagramColor;
  dim?: boolean;
}

export function DiagramEdge({ d, markerId, label, lx, ly, stroke = "border-strong", dim }: DiagramEdgeProps) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={diagramColor(dim ? "border" : stroke)}
        strokeWidth="1.5"
        strokeDasharray={dim ? "4 4" : undefined}
        markerEnd={markerId ? `url(#${markerId})` : undefined}
      />
      {label != null && (
        <text x={lx} y={ly} textAnchor="middle" fontFamily="var(--sd-font-mono)" fontSize="10.5" fill="var(--sd-muted)">
          {label}
        </text>
      )}
    </g>
  );
}
