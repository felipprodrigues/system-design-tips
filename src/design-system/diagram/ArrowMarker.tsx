import { diagramColor, type DiagramColor } from "./diagramColor";

export interface ArrowMarkerProps {
  id: string;
  color?: DiagramColor;
}

/* Marker ids are document-global, so two diagrams on one page need two ids. */
export function ArrowMarker({ id, color = "muted" }: ArrowMarkerProps) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={diagramColor(color)} />
    </marker>
  );
}
