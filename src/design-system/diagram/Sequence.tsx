import type { ComponentType, ReactNode, SVGProps } from "react";
import { diagramColor, type DiagramColor } from "./diagramColor";

export interface Lane {
  label: string;
  x: number;
  accent?: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface LifelinesProps {
  lanes: Lane[];
  bottom: number;
  width?: number;
  headHeight?: number;
}

export function Lifelines({ lanes, bottom, width = 144, headHeight = 36 }: LifelinesProps) {
  return (
    <>
      {lanes.map((lane) => {
        const Icon = lane.icon;
        const left = lane.x - width / 2;
        const stroke = lane.accent ? "var(--sd-teal)" : "var(--sd-border-strong)";
        return (
          <g key={lane.label}>
            <rect x={left} y={10} width={width} height={headHeight} rx={8} fill="var(--sd-surface2)" stroke={stroke} strokeWidth="1.5" />
            {Icon && (
              <Icon
                x={left + 12}
                y={10 + (headHeight - 18) / 2}
                width={18}
                height={18}
                strokeWidth={1.7}
                stroke={lane.accent ? "var(--sd-teal)" : "var(--sd-accent)"}
              />
            )}
            <text
              x={Icon ? left + 36 : lane.x}
              y={10 + headHeight / 2 + 5}
              textAnchor={Icon ? "start" : "middle"}
              fontFamily="var(--sd-font-mono)"
              fontSize="12"
              fontWeight="700"
              fill="var(--sd-text)"
            >
              {lane.label}
            </text>
            <line x1={lane.x} y1={10 + headHeight} x2={lane.x} y2={bottom} stroke="var(--sd-border)" strokeWidth="1" strokeDasharray="3 4" />
          </g>
        );
      })}
    </>
  );
}

export interface MessageProps {
  from: number;
  to: number;
  y: number;
  label: ReactNode;
  markerId: string;
  color?: DiagramColor;
}

export function Message({ from, to, y, label, markerId, color }: MessageProps) {
  const inset = to > from ? -6 : 6;
  return (
    <g>
      <line
        x1={from}
        y1={y}
        x2={to + inset}
        y2={y}
        stroke={color ? diagramColor(color) : "var(--sd-border-strong)"}
        strokeWidth="1.5"
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={(from + to) / 2}
        y={y - 8}
        textAnchor="middle"
        fontFamily="var(--sd-font-mono)"
        fontSize="11"
        fill={color ? diagramColor(color) : "var(--sd-muted)"}
      >
        {label}
      </text>
    </g>
  );
}
