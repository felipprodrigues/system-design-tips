export type TokenGroup = "surface" | "text" | "brand" | "diagram" | "status" | "destination" | "type" | "layout" | "radius";

export interface TokenDoc {
  name: `--sd-${string}`;
  group: TokenGroup;
  usage: string;
}

export const TOKENS: TokenDoc[] = [
  { name: "--sd-bg", group: "surface", usage: "Page background; also the inset fill of concept pills and code blocks" },
  { name: "--sd-surface", group: "surface", usage: "First raised layer: prose cards, figures, tables, panels" },
  { name: "--sd-surface2", group: "surface", usage: "Second raised layer: cards inside a surface, table headers, soft buttons" },
  { name: "--sd-border", group: "surface", usage: "Hairline border on every card" },
  { name: "--sd-border-strong", group: "surface", usage: "Hover borders, diagram strokes, progress tracks" },

  { name: "--sd-text", group: "text", usage: "Primary copy and headings" },
  { name: "--sd-muted", group: "text", usage: "Secondary copy, eyebrows, captions, diagram labels" },

  { name: "--sd-accent", group: "brand", usage: "The one brand blue: links, active states, accent eyebrows" },
  { name: "--sd-accent-wash", group: "brand", usage: "Accent tint behind selected chips, callouts and highlights" },

  { name: "--sd-teal", group: "diagram", usage: "Desaturated blue. Diagram hue and key-term colour, not a status" },
  { name: "--sd-green", group: "diagram", usage: "Lighter blue despite the name. Diagram hue and positive marks" },
  { name: "--sd-amber", group: "diagram", usage: "Slate blue despite the name. Diagram hue for the 'before' side" },
  { name: "--sd-red", group: "diagram", usage: "Dark slate despite the name. Diagram hue, not an error colour" },

  { name: "--sd-done", group: "status", usage: "Completed status: badges, progress bars, ticks" },
  { name: "--sd-done-wash", group: "status", usage: "Tint behind a completed badge" },
  { name: "--sd-danger", group: "status", usage: "Genuine red, reserved for 'this is a mistake' content" },
  { name: "--sd-danger-wash", group: "status", usage: "Tint behind common-mistake cards" },

  { name: "--sd-warm", group: "destination", usage: "The Method banner; 'what I saw' claims" },
  { name: "--sd-warm-wash", group: "destination", usage: "Tint for warm banners and saved stars" },
  { name: "--sd-violet", group: "destination", usage: "Capstone banners" },
  { name: "--sd-violet-wash", group: "destination", usage: "Tint for violet banners" },
  { name: "--sd-pink", group: "destination", usage: "Frontend 101 banners and badges" },
  { name: "--sd-pink-wash", group: "destination", usage: "Tint for pink banners" },

  { name: "--sd-font", group: "type", usage: "Body copy (Public Sans)" },
  { name: "--sd-font-display", group: "type", usage: "Headings and titles (Bricolage Grotesque)" },
  { name: "--sd-font-mono", group: "type", usage: "Eyebrows, labels, numbers, code (IBM Plex Mono)" },

  { name: "--sd-page-max", group: "layout", usage: "Reading measure of a concept page" },
  { name: "--sd-page-pad-x", group: "layout", usage: "Horizontal page padding" },
  { name: "--sd-page-pad-y", group: "layout", usage: "Top padding of a page" },

  { name: "--sd-radius-xs", group: "radius", usage: "Inline tags and kind labels" },
  { name: "--sd-radius-sm", group: "radius", usage: "Buttons, icon buttons, diagram nodes, panel cards" },
  { name: "--sd-radius-md", group: "radius", usage: "Cards, marker-list rows, compare cards" },
  { name: "--sd-radius-lg", group: "radius", usage: "Prose blocks, figures, tables, surface cards" },
  { name: "--sd-radius-xl", group: "radius", usage: "Quiz card and other hero-sized containers" },
  { name: "--sd-radius-pill", group: "radius", usage: "Chips, status badges, pill buttons" },
];

export const tokensIn = (group: TokenGroup) => TOKENS.filter((token) => token.group === group);

export function readToken(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
