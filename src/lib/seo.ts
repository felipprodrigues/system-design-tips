import type { Metadata } from "next";
import { groups } from "./lessons";

/** Canonical origin. Every canonical URL and sitemap entry is built from it. */
export const SITE_URL = "https://systemdesignbits.vercel.app";
export const SITE_NAME = "System Design Roadmap";

const bySlug = new Map(groups.flatMap((g) => g.lessons.map((l) => [l.slug, l] as const)));

/** Per-lesson title, description and canonical, for the /lessons/[slug] route. */
export function lessonMetadata(slug: string): Metadata {
  const lesson = bySlug.get(slug);
  if (!lesson) throw new Error(`Unknown lesson slug: ${slug}`);

  const path = `/lessons/${slug}`;
  return {
    title: lesson.title,
    description: lesson.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      siteName: SITE_NAME,
      title: `${lesson.title} · ${SITE_NAME}`,
      description: lesson.description,
    },
  };
}
