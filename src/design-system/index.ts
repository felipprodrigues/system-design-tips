export { TONES, toneColor, toneVars, toneWash, type Tone } from "./tone";
export type { TextTag, Toned } from "./types";

export { Eyebrow, type EyebrowProps, type EyebrowVariant } from "./primitives/Eyebrow/Eyebrow";
export { Heading, type HeadingLevel, type HeadingProps } from "./primitives/Heading/Heading";
export {
  Highlight,
  Strong,
  Text,
  type HighlightProps,
  type HighlightTone,
  type TextProps,
  type TextVariant,
} from "./primitives/Text/Text";
export { Prose, type ProseProps } from "./primitives/Prose/Prose";
export { Card, type CardProps, type CardVariant } from "./primitives/Card/Card";
export { Callout, PanelNote, type CalloutProps, type PanelNoteProps } from "./primitives/Callout/Callout";
export { Figure, type FigureProps } from "./primitives/Figure/Figure";
export { Badge, type BadgeProps, type BadgeVariant } from "./primitives/Badge/Badge";
export { Chip, ChipGroup, type ChipGroupProps, type ChipProps } from "./primitives/Chip/Chip";
export {
  Button,
  buttonStyles,
  type ButtonProps,
  type ButtonStyleOptions,
  type ButtonVariant,
} from "./primitives/Button/Button";
export { IconButton, type IconButtonProps, type IconButtonVariant } from "./primitives/IconButton/IconButton";
export { NumberBadge, type NumberBadgeProps } from "./primitives/NumberBadge/NumberBadge";
export { DataTable, type DataTableColumn, type DataTableProps } from "./primitives/DataTable/DataTable";
export { ProgressBar, type ProgressBarProps } from "./primitives/ProgressBar/ProgressBar";

export { Section, type SectionProps } from "./patterns/Section/Section";
export { QuizSection, type QuizSectionProps } from "./patterns/QuizSection/QuizSection";
export { PullQuote, type PullQuoteProps } from "./patterns/PullQuote/PullQuote";
export { DefinitionList, type Definition, type DefinitionListProps } from "./patterns/DefinitionList/DefinitionList";
export { NumberedItem, type NumberedItemProps } from "./patterns/NumberedItem/NumberedItem";
export { DotList, type DotListProps } from "./patterns/DotList/DotList";
export { ComparisonCard, type ComparisonCardProps } from "./patterns/ComparisonCard/ComparisonCard";
export { Versus, type VersusProps } from "./patterns/Versus/Versus";
export { Banner, type BannerProps } from "./patterns/Banner/Banner";

export { Diagram, type DiagramProps } from "./diagram/Diagram";
export { ArrowMarker, type ArrowMarkerProps } from "./diagram/ArrowMarker";
export { DiagramNode, type DiagramNodeProps } from "./diagram/DiagramNode";
export { DiagramEdge, type DiagramEdgeProps } from "./diagram/DiagramEdge";
export { Lifelines, Message, type Lane, type LifelinesProps, type MessageProps } from "./diagram/Sequence";
export { diagramColor, type DiagramColor } from "./diagram/diagramColor";
export type { Point, Rect } from "./diagram/types";

/* Shared components that still live in src/components. Re-exported so pages can
   import everything from one place now; moving one into the design system later
   changes this line and no call site. */
export { default as Hero } from "@/components/Layout/Hero";
export { default as Breadcrumb } from "@/components/Layout/Breadcrumb";
export { default as PageNav } from "@/components/Layout/PageNav";
export { default as PageLayout } from "@/components/Layout/PageLayout";
export { default as ConceptLayout } from "@/components/Concept/ConceptLayout";
export { default as QuizCarousel, type QuizCard } from "@/components/Carousel/QuizCarousel";
export { default as SidePanel } from "@/components/SidePanel/SidePanel";
export { default as PanelSection } from "@/components/SidePanel/PanelSection";
export { default as MarkerList } from "@/components/MarkerList/MarkerList";
export { default as Term } from "@/components/Term/Term";
export { default as DeepDiveButton } from "@/components/Button/DeepDiveButton";
export { default as ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
export { default as ProgressRing } from "@/components/Dashboard/ProgressRing";
