import { readTime } from "./readTime";

/* Readable pages that are not concepts. Imported by scripts/read-time.mjs, which
   is why `sources` lives here rather than in the script.

   Case studies are deliberately absent: that page is a list of links to other
   people's writing, so none of its reading happens here. */
export interface ContentPage {
  /** Key in the read-time map, and the progress slug. Must not collide with a concept's. */
  slug: string;
  /** How LearnedToggle recognises the page from the path it is rendered on. */
  href: string;
  sources: string[];
}

export const pages: ContentPage[] = [
  {
    slug: "walkthrough",
    href: "/walkthrough",
    sources: ["src/app/walkthrough/Walkthrough.tsx"],
  },
  {
    slug: "frontend",
    href: "/frontend",
    sources: ["src/app/frontend/FrontendDesign.tsx", "src/app/frontend/data.ts"],
  },
  {
    slug: "interview-qa",
    href: "/interview-qa",
    sources: ["src/content/interview-qa.html"],
  },
];

export const pageMinutes = (slug: string) => readTime[slug] ?? 0;
