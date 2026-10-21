import type { Metadata } from "next";
import { groups } from "./concepts";

/** Canonical origin. Every canonical URL and sitemap entry is built from it. */
export const SITE_URL = "https://systemdesignbits.vercel.app";
export const SITE_NAME = "System Design Roadmap";

const bySlug = new Map(groups.flatMap((g) => g.concepts.map((l) => [l.slug, l] as const)));

/** Per-concept title, description and canonical, for the /concepts/[slug] route. */
export function conceptMetadata(slug: string): Metadata {
  const concept = bySlug.get(slug);
  if (!concept) throw new Error(`Unknown concept slug: ${slug}`);

  const path = `/concepts/${slug}`;
  return {
    title: concept.title,
    description: concept.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      siteName: SITE_NAME,
      title: `${concept.title} · ${SITE_NAME}`,
      description: concept.description,
    },
  };
}
