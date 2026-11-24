import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { DiagramNodeProps, Lane, MessageProps, Point, Rect } from "@/design-system";
import type { ConceptEntry } from "@/lib/concepts";
import type { ExampledColumn, Hue } from "@/types/content";

export interface BoxProps extends Point, Partial<Pick<Rect, "w" | "h">> {
  label: string;
  sub?: string;
  /** Stamps the stage that introduced this node, which is what makes the full
      picture read as a history rather than as another architecture diagram. */
  n?: number;
  accent?: boolean;
  /** The piece this stage just added, ringed so the eye finds it. */
  isNew?: boolean;
  /** A lucide icon renders as a nested <svg>, positioned with x and y like any
      other SVG child. With one present the text left-aligns beside it. */
  icon?: LucideIcon;
}

export interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  /** Observability reads from the pieces rather than sitting in the traffic path,
      so its edges are dashed to say they carry telemetry, not requests. */
  dash?: boolean;
  accent?: boolean;
  /** Nudges off the default offset, for the few edges whose gap is too tight
      for a label to sit above-right of the midpoint without hitting a box. */
  labelDx?: number;
  labelDy?: number;
}

export interface Placed {
  from: number;
  /** Last stage this exists for, when a later stage replaces it. */
  until?: number;
}

export interface StagedNode extends Placed, Point, Partial<Pick<Rect, "w">> {
  id: string;
  label: string;
  icon: LucideIcon;
  sub?: string;
  accent?: boolean;
}

export type IconLane = Lane & Required<Pick<Lane, "icon">>;

export type AccentNodeProps = Rect & Pick<DiagramNodeProps, "label" | "sub"> & { accent?: boolean };

export type SequenceMessageProps = Pick<MessageProps, "from" | "to" | "y" | "label">;

export interface ExampledColumnProps {
  item: ExampledColumn;
}

export interface NamedStep {
  name: string;
  body: ReactNode;
}

export interface PathStep {
  label: string;
  value: string;
}

export interface FurtherReading {
  title: string;
  source: string;
  note: string;
  href: string;
}

export interface TaggedCard {
  name: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  body: string;
}

export interface KindNode extends Point, Pick<Rect, "w"> {
  kind: string;
  name: string;
  accent: boolean;
}

export interface RolePoint {
  role: string;
  body: string;
}

export interface StyleProfile extends Hue {
  label: string;
  analogy: string;
  points: RolePoint[];
}

export type DeepDiveLink = Pick<ConceptEntry, "slug" | "title"> & {
  /** The closest concept rather than a dedicated one. */
  nearest?: boolean;
};

export interface CapstoneStage {
  piece: string;
  scale: string;
  shows: string;
  trigger: string;
  fix: string;
  cost: string;
  dive: DeepDiveLink;
}
